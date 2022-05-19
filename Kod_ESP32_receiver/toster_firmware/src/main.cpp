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
  ledcSetup(PinA1, 20000, 10);
  ledcSetup(PinA2, 20000, 10);
  ledcSetup(PinB1, 20000, 10);
  ledcSetup(PinB2, 20000, 10);

  //dodanie pinów fizycznych do kanałów PWM
  ledcAttachPin(4, 0);
  ledcAttachPin(2, 2);
  ledcAttachPin(15, 3); 
  ledcAttachPin(13, 4); 

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

  // Get Mac Add
  // Serial.print("Mac Address: ");
  // Serial.print(WiFi.macAddress());
  // Serial.println("\nESP-Now Receiver");
  
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

//funkcja kalibrująca wartości Xavg i Yavg do uśrednionej wartości aktualnego położenia drążków
void setMidPos () {

  unsigned long time1 = 0;

  Yavg = 0;
  Xavg = 0;

  for (int i = 0; i < 10; i++) {

    while ((millis() - time1) < 10) {
    }

    time1 = millis();

    Yavg += myMessage.analValues[2];
    Xavg += myMessage.analValues[0];
  }

  Xavg = Xavg/10;
  Yavg = Yavg/10;
}

//główna funkcja ruchu
void move () {

  R = Y + X;
  L = Y - X;

  if (R > 0) {
    ledcWrite(PinA1, R);
    ledcWrite(PinA2, 0);
  } else {
    ledcWrite(PinA1, 0);
    ledcWrite(PinA2, -1*R);
  }

    if (L > 0) {
    ledcWrite(PinB1, L);
    ledcWrite(PinB2, 0);
  } else {
    ledcWrite(PinB1, 0);
    ledcWrite(PinB2, -1*L);
  }

}


void loop() {

//pierwsza kalibracja położenia drążków - po otrzymaniu pierwszych danych
if (recFlag == 1 && firstTimeSetup == 1) {
  setMidPos();
  firstTimeSetup = 0;
}

//kalibracja drążków przypisana do przycisku 1
if (myMessage.digiValues[1] == 1) {
  setMidPos();
}

//dziejąca się za każdym otrzymaniem ramki, update pwm na silniki
if (recFlag == 1) {

  X = map11to10bit(Xavg, myMessage.analValues[0]);
  Y = map11to10bit(Yavg, myMessage.analValues[2]);

  move();

  recFlag = 0;
}

delay(1);
}