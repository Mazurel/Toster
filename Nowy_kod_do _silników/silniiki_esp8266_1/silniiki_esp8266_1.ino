#define PinA1 D2
#define PinA2 D5
#define PinB1 D6
#define PinB2 D8
#define freq 20000

void setup() {
  analogWriteFreq(freq);
  pinMode(PinA1, OUTPUT);
  pinMode(PinA2, OUTPUT);
  pinMode(PinB1, OUTPUT);
  pinMode(PinB2, OUTPUT);

  digitalWrite(13, 1);
  delay(500);
  digitalWrite(13, 0);
  delay(500);
  digitalWrite(13, 1);
  delay(500);
  digitalWrite(13, 0);

  Serial.begin(9600);
}

int Y = 0;
int X = 0;
int YR = 0;
int YL = 0;
char D = 'L';

void setPWM(char silnik, int PWM){
  char dir;
  if(PWM < 0){
    dir = 'B';
    PWM = -PWM;
  }
  else{
    dir = 'F';
  }
  switch(silnik){
    case 'L':
    switch(dir){
      case 'F':
      analogWrite(PinA1, 0);
      analogWrite(PinA2, PWM*4);
      break;
      case 'B':
      analogWrite(PinA1, PWM*4);
      analogWrite(PinA2, 0);
      break;
    }
    break;
    case 'R':
    switch(dir){
      case 'F':
      analogWrite(PinB1, 0);
      analogWrite(PinB2, PWM*4);
      break;
      case 'B':
      analogWrite(PinB1, PWM*4);
      analogWrite(PinB2, 0);
      break;
    }
    break;
  }
}

void turn(){
  if(Y>=0){
    if(Y>255-(X/2)){
      switch(D){
        case 'L':
        YR = 255;
        YL = 255-X;
        break;
        case 'R':
        YR = 255-X;
        YL = 255;
        break;
      }
    }else{
      switch(D){
        case 'L':
        YR = Y+(X/2);
        YL = Y-(X/2);
        break;
        case 'R':
        YR = Y-(X/2);
        YL = Y+(X/2);
        break;
      }
    }
  }else{
    if(Y<-255+(X/2)){
      switch(D){
        case 'L':
        YR = -255;
        YL = -255+X;
        break;
        case 'R':
        YR = -255+X;
        YL = -255;
        break;
      }
    }else{
      switch(D){
        case 'L':
        YR = Y-(X/2);
        YL = Y+(X/2);
        break;
        case 'R':
        YR = Y+(X/2);
        YL = Y-(X/2);
        break;
      }
    }
  }
  setPWM('L',YL);
  setPWM('R',YR);
}


void loop() {
  while (Serial.available() > 0){
    char sread = Serial.read();
    switch(sread){
    case 'F':
    Y = Serial.parseInt();
    turn();
    break;
    case 'B':
    Y = -Serial.parseInt();
    turn();
    break;
    case 'L':
    D = 'L';
    X = Serial.parseInt();
    turn();
    Serial.println((String)"Y= "+Y);
    Serial.println((String)"YR= "+YR);
    Serial.println((String)"YL= "+YL);
    Serial.println((String)"D= "+D);
    Serial.println((String)"X= "+X);
    break;
    case 'R':
    D = 'R';
    X = Serial.parseInt();
    turn();
    Serial.println((String)"Y= "+Y);
    Serial.println((String)"YR= "+YR);
    Serial.println((String)"YL= "+YL);
    Serial.println((String)"D= "+D);
    Serial.println((String)"X= "+X);
    break;
    }
  }
}
