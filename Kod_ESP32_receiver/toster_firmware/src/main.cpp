#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>

//przypisanie numerów kanałów do pinów fizycznych
const int PinA1 = 0;
const int PinA2 = 2;
const int PinB1 = 4;
const int PinB2 = 3;

boolean recFlag = 0; //flaga że została odebrana ramka
boolean firstTimeSetup = 1; //flaga aktywująca się po pierwszym uzyskaniu połączenia
int Yavg = 0; //wartość osi Y środkowa
int Xavg = 0; //wartość osi X środkowa
//do sterowania
int L = 0;
int R = 0;
int X = 0;
int Y = 0;
int deadZoneHigh = 300;
int deadZoneLow = 200;
bool hysterysisX = 0;
bool hysterysisY = 0;
int gear = 1;

int startTimeout = 0;
boolean timedOut = 0;
boolean digiValuesPrev[17];
//struktura ramki przysłanej z kontrolera
typedef struct message {
   uint16_t analValues[4];
   uint8_t digiValues[17];
} message;
message myMessage;

//za odebraniem pakietu...
void OnDataRecv(const uint8_t * mac, const uint8_t *incomingData, int len) {
   // We don't use mac to verify the sender
   // Let us transform the incomingData into our message structure
  memcpy(&myMessage, incomingData, sizeof(myMessage));
  recFlag = 1;  //oflagowanie że została odebrana ramka

}

void setup() {

  //konfiguracja pinów
  pinMode(4, OUTPUT);
  pinMode(2, OUTPUT);
  pinMode(15, OUTPUT);
  pinMode(13, OUTPUT);
  
  //konfiguracja kanałów PWM
  ledcSetup(PinA1, 20000, 11);
  ledcSetup(PinA2, 20000, 11);
  ledcSetup(PinB1, 20000, 11);
  ledcSetup(PinB2, 20000, 11);

  //dodanie pinów fizycznych do kanałów PWM
  ledcAttachPin(12, PinB1);
  ledcAttachPin(14, PinB2);
  ledcAttachPin(27, PinA2); 
  ledcAttachPin(26, PinA1); 

  //pwm startowe = 0
  ledcWrite(PinA1, 0);
  ledcWrite(PinA2, 0);
  ledcWrite(PinB1, 0);
  ledcWrite(PinB2, 0);

  //port szeregowy do debugu
  Serial.begin(9600);

  //konfiguracja wifi do ESP-NOW
  WiFi.disconnect();
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false); 

  //Get Mac Add
  Serial.print("Mac Address: ");
  Serial.print(WiFi.macAddress());
  Serial.println("\nESP-Now Receiver");
  
  //rejestracja ESP-NOW
  esp_now_init();
  esp_now_register_recv_cb(OnDataRecv);
  

  recFlag = 0;  //wartość początkowa

}

//funkcja mapująca wartość od 0 do 4096 do wartości od -2048 do 2048 z uwzględnieniem kalibracji punktu środkowego
int map11to10bit (int average, int input) {

  if (input > average) {
    return map(input, average, 4095, 0, 2048);
  } else {
    return map(input, 0, average, -2048, 0);
  }

}

void deadZone () {
    
  if (abs(X) > deadZoneHigh) {
    hysterysisX = false;
  } else if (abs(X) < deadZoneLow) {
    hysterysisX = true;
  } 

  if (hysterysisX) {
    X = 0;
  }


  if (abs(Y) > deadZoneHigh) {
    hysterysisY = false;
  } else if (abs(Y) < deadZoneLow) {
    hysterysisY = true;
  } 

  if (hysterysisY) {
    Y = 0;
  }

}

//debug wartości analogowych
void debugValues () {
  if (recFlag == 1) {

    Serial.print(myMessage.analValues[0]);
    Serial.print(" ");
    Serial.print(myMessage.analValues[1]);
    Serial.print(" ");
    Serial.print(myMessage.analValues[2]);
    Serial.print(" ");
    Serial.print(myMessage.analValues[3]);
    Serial.println(" ");
    recFlag = 0;
  }
}

//debug wartości średnich
void debugAvg () {
  Serial.print(Yavg);
Serial.print("  ");
Serial.print(myMessage.analValues[2]);
Serial.print("  ");
Serial.println(map11to10bit(Yavg, myMessage.analValues[2]));
}

void debugDigi() {
  for (int i = 0; i < 17; i++) {
    Serial.print(i);
    Serial.print(": ");
    Serial.print(myMessage.digiValues[i]);
    Serial.print("  ");
  }
  Serial.println("");
}

void debugXY () {
  Serial.print("X: ");
  Serial.print(X);
  Serial.print("    Y: ");
  Serial.print(Y);
  Serial.print("R: ");
  Serial.print(R);
  Serial.print("    L: ");
  Serial.println(L);
}

//funkcja kalibrująca wartości Xavg i Yavg do uśrednionej wartości aktualnego położenia drążków
void setMidPos () {

  unsigned long time1 = 0;

  Yavg = 0;
  Xavg = 0;

  for (int i = 0; i < 10; i++) {

    while ((millis() - time1) < 100) {
    }

    time1 = millis();

    Yavg += myMessage.analValues[2];
    Xavg += myMessage.analValues[0];
  }

  Xavg = Xavg/10;
  Yavg = Yavg/10;
}

void buttons() {

if (myMessage.digiValues[0] == 1 && digiValuesPrev[0] == 0) {
    //todo
}
digiValuesPrev[0] = myMessage.digiValues[0];

if (myMessage.digiValues[1] == 1 && digiValuesPrev[1] == 0) {
  setMidPos();
}
digiValuesPrev[1] = myMessage.digiValues[1];

if (myMessage.digiValues[2] == 1 && digiValuesPrev[2] == 0) {
    //todo
}
digiValuesPrev[2] = myMessage.digiValues[2];

if (myMessage.digiValues[3] == 1 && digiValuesPrev[3] == 0) {
    //todo
}
digiValuesPrev[3] = myMessage.digiValues[3];

if (myMessage.digiValues[4] == 1 && digiValuesPrev[4] == 0) {
    //todo
}
digiValuesPrev[4] = myMessage.digiValues[4];

if (myMessage.digiValues[5] == 1 && digiValuesPrev[5] == 0) {
    //todo
}
digiValuesPrev[5] = myMessage.digiValues[5];

if (myMessage.digiValues[6] == 1 && digiValuesPrev[6] == 0) {
    //todo
}
digiValuesPrev[6] = myMessage.digiValues[6];

if (myMessage.digiValues[7] == 1 && digiValuesPrev[7] == 0) {
    //todo
}
digiValuesPrev[7] = myMessage.digiValues[7];

if (myMessage.digiValues[8] == 1 && digiValuesPrev[8] == 0) {
    //todo
}
digiValuesPrev[8] = myMessage.digiValues[8];

if (myMessage.digiValues[9] == 1 && digiValuesPrev[9] == 0) {
    //todo
}
digiValuesPrev[9] = myMessage.digiValues[9];

if (myMessage.digiValues[10] == 1 && digiValuesPrev[10] == 0) {
    //todo
}
digiValuesPrev[10] = myMessage.digiValues[10];

if (myMessage.digiValues[11] == 1 && digiValuesPrev[11] == 0) {
    //todo
}
digiValuesPrev[11] = myMessage.digiValues[11];

if (myMessage.digiValues[12] == 1 && digiValuesPrev[12] == 0) {
    //todo
}
digiValuesPrev[12] = myMessage.digiValues[12];

if (myMessage.digiValues[13] == 1 && digiValuesPrev[13] == 0) {
    //todo
}
digiValuesPrev[13] = myMessage.digiValues[13];

if (myMessage.digiValues[14] == 1 && digiValuesPrev[14] == 0) {
    //gear down
    if (gear < 4) {
      gear = gear + 1;
    }
}
digiValuesPrev[14] = myMessage.digiValues[14];

if (myMessage.digiValues[15] == 1 && digiValuesPrev[15] == 0) {
    //todo
}
digiValuesPrev[15] = myMessage.digiValues[15];

if (myMessage.digiValues[16] == 1 && digiValuesPrev[16] == 0) {
    //gear up
    if (gear > 1) {
      gear = gear - 1;
    }
}
digiValuesPrev[16] = myMessage.digiValues[16];
}

//główna funkcja ruchu
void move () {

  //równania ruchu lewej i prawej gąsienicy
  R = Y + X;
  L = Y - X;

  //sterowanie lewą (B1 B2) i prawą (A1 A2) gąsienicą
  if (R > 0) {
    ledcWrite(PinA1, R/gear);
    ledcWrite(PinA2, 0);
  } else {
    ledcWrite(PinA1, 0);
    ledcWrite(PinA2, -1*R/gear);
  }

    if (L > 0) {
    ledcWrite(PinB1, L/gear);
    ledcWrite(PinB2, 0);
  } else {
    ledcWrite(PinB1, 0);
    ledcWrite(PinB2, -1*L/gear);
  }

}


void loop() {

//pierwsza kalibracja położenia drążków - po otrzymaniu pierwszych danych
if (recFlag == 1 && firstTimeSetup == 1) {
  setMidPos();
  firstTimeSetup = 0;
}

buttons();

//dziejąca się za każdym otrzymaniem ramki, update pwm na silniki
if (recFlag == 1) {

  timedOut = 0;
  startTimeout = 0;

  X = map11to10bit(Xavg, myMessage.analValues[0]);
  Y = map11to10bit(Yavg, myMessage.analValues[2]);

  //deadzone
  deadZone();

  // debugXY();
  // debugDigi();
  move();

  recFlag = 0;

} else {
  
  if (startTimeout == 0) {
    startTimeout = millis();
  }

  if (millis() - startTimeout > 10000) {
    //przejście na autonomiczne
  }

}

//miejsce na funkcje autonomiczną (rpi)

delay(1);
}