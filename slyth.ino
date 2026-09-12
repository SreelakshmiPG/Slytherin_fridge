#include <Wire.h>
#include <SPI.h>
#include <LiquidCrystal_I2C.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ==================================================
// WI-FI SETTINGS
// ==================================================

// CHANGE THESE TWO VALUES
const char* WIFI_SSID = "Hai1";
const char* WIFI_PASSWORD = "sree1234";

// YOUR LAPTOP IP - DO NOT CHANGE
const char* SERVER_URL = "http://10.136.1.96:5000/update";


// ==================================================
// PIN DEFINITIONS
// ==================================================

#define REED_PIN 25
#define IR_PIN 26
#define BUZZER_PIN 32

// RFID RC522
#define SS_PIN 5
#define RST_PIN 27

// Servos
#define SERVO1_PIN 13
#define SERVO2_PIN 14


// ==================================================
// LCD
// ==================================================

LiquidCrystal_I2C lcd(0x27, 16, 4);


// ==================================================
// RFID
// ==================================================

MFRC522 rfid(SS_PIN, RST_PIN);


// ==================================================
// SERVOS
// ==================================================

Servo servo1;
Servo servo2;


// ==================================================
// VARIABLES
// ==================================================

bool doorWasOpen = false;

bool activityDetected = false;

bool unnecessaryCounted = false;

bool servo1Unlocked = false;
bool servo2Unlocked = false;

unsigned long doorOpenTime = 0;

// 5 seconds
const unsigned long WARNING_TIME = 3000;

int fridgeOpenCount = 0;
int unnecessaryCount = 0;


// ==================================================
// SEND DATA TO WEBSITE
// ==================================================

void sendDataToWebsite() {

  // Check Wi-Fi connection
  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("WiFi not connected - data not sent");

    return;
  }


  // Create HTTP connection
  HTTPClient http;

  http.begin(SERVER_URL);

  http.addHeader("Content-Type", "application/json");


  // ==================================================
  // CREATE JSON DATA
  // ==================================================

  String json = "{";


  // Door status
  json += "\"door\":\"";

  if (doorWasOpen) {
    json += "OPEN";
  }
  else {
    json += "CLOSED";
  }

  json += "\",";


  // Fridge opening count
  json += "\"opens\":";
  json += fridgeOpenCount;
  json += ",";


  // Unnecessary opening count
  json += "\"unnecessary\":";
  json += unnecessaryCount;
  json += ",";


  // Container 1
  json += "\"container1\":\"";

  if (servo1Unlocked) {
    json += "UNLOCKED";
  }
  else {
    json += "LOCKED";
  }

  json += "\",";


  // Container 2
  json += "\"container2\":\"";

  if (servo2Unlocked) {
    json += "UNLOCKED";
  }
  else {
    json += "LOCKED";
  }

  json += "\"";


  // Finish JSON
  json += "}";


  // ==================================================
  // SEND DATA
  // ==================================================

  Serial.println();
  Serial.println("--------------------------------");
  Serial.println("Sending data to website:");
  Serial.println(json);
  Serial.println("--------------------------------");


  int responseCode = http.POST(json);


  Serial.print("Server response: ");
  Serial.println(responseCode);


  // Close HTTP connection
  http.end();
}


// ==================================================
// UPDATE LCD
// ==================================================

void updateLCD() {

  lcd.setCursor(0, 0);
  lcd.print("FRIDGE SYSTEM   ");

  lcd.setCursor(0, 1);
  lcd.print("Opens: ");
  lcd.print(fridgeOpenCount);
  lcd.print("        ");

  lcd.setCursor(0, 2);
  lcd.print("Unnec: ");
  lcd.print(unnecessaryCount);
  lcd.print("        ");

  lcd.setCursor(0, 3);

  if (doorWasOpen) {
    lcd.print("Door: OPEN      ");
  }
  else {
    lcd.print("Door: CLOSED    ");
  }
}


// ==================================================
// SETUP
// ==================================================

void setup() {

  Serial.begin(115200);


  // ==================================================
  // CONNECT TO WI-FI
  // ==================================================

  Serial.println();
  Serial.println("================================");
  Serial.println("CONNECTING TO WI-FI");
  Serial.println("================================");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting");

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");
  }

  Serial.println();

  Serial.println("WiFi connected!");

  Serial.print("ESP32 IP address: ");
  Serial.println(WiFi.localIP());


  // ==================================================
  // REED SWITCH
  // ==================================================

  pinMode(REED_PIN, INPUT_PULLUP);


  // ==================================================
  // IR SENSOR
  // ==================================================

  pinMode(IR_PIN, INPUT);


  // ==================================================
  // BUZZER
  // ==================================================

  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);


  // ==================================================
  // LCD
  // ==================================================

  Wire.begin(21, 22);

  lcd.init();

  lcd.backlight();

  lcd.clear();

  updateLCD();


  // ==================================================
  // RFID
  // ==================================================

  SPI.begin(18, 19, 23, 5);

  rfid.PCD_Init();

  delay(100);


  // ==================================================
  // SERVOS
  // ==================================================

  servo1.attach(SERVO1_PIN);

  servo2.attach(SERVO2_PIN);


  // Start locked
  servo1.write(0);

  servo2.write(0);


  // ==================================================
  // STARTUP MESSAGE
  // ==================================================

  Serial.println();
  Serial.println("================================");
  Serial.println("FRIDGE SYSTEM STARTED");
  Serial.println("================================");

  Serial.println("Both containers LOCKED");

  Serial.println("System ready...");


  // ==================================================
  // SEND INITIAL DATA
  // ==================================================

  sendDataToWebsite();
}


// ==================================================
// MAIN LOOP
// ==================================================

void loop() {

  int doorState = digitalRead(REED_PIN);

  int irState = digitalRead(IR_PIN);


  // ==================================================
  // FRIDGE DOOR OPEN
  // ==================================================

  if (doorState == HIGH) {


    // ==================================================
    // DOOR HAS JUST OPENED
    // ==================================================

    if (!doorWasOpen) {

      doorWasOpen = true;

      activityDetected = false;

      unnecessaryCounted = false;


      // Start 5-second timer
      doorOpenTime = millis();


      // Count fridge opening
      fridgeOpenCount++;


      // Lock both containers
      servo1.write(0);

      servo2.write(0);

      servo1Unlocked = false;

      servo2Unlocked = false;


      // Buzzer OFF
      digitalWrite(BUZZER_PIN, LOW);


      // Serial messages
      Serial.println();
      Serial.println("================================");
      Serial.println("FRIDGE DOOR OPENED");
      Serial.println("================================");

      Serial.print("Opening count: ");
      Serial.println(fridgeOpenCount);

      Serial.println("Containers LOCKED");

      Serial.println("Waiting for activity or RFID...");


      // Update LCD
      updateLCD();


      // Send data to website
      sendDataToWebsite();
    }


    // ==================================================
    // IR ACTIVITY DETECTION
    // ==================================================

    // LOW = activity detected

    if (irState == LOW) {

      if (!activityDetected) {

        Serial.println("Activity detected by IR");

      }

      activityDetected = true;
    }


    // ==================================================
    // RFID CHECK
    // ==================================================

    if (rfid.PICC_IsNewCardPresent() &&
        rfid.PICC_ReadCardSerial()) {


      bool authorizedTag = false;


      // ==================================================
      // PRINT RFID UID
      // ==================================================

      Serial.print("RFID UID: ");

      for (byte i = 0; i < rfid.uid.size; i++) {

        if (rfid.uid.uidByte[i] < 0x10) {

          Serial.print("0");

        }

        Serial.print(rfid.uid.uidByte[i], HEX);

        Serial.print(" ");
      }

      Serial.println();


      // ==================================================
      // TAG 1 → SERVO 1
      // UID = E9 B9 B7 03
      // ==================================================

      if (rfid.uid.size == 4 &&
          rfid.uid.uidByte[0] == 0xE9 &&
          rfid.uid.uidByte[1] == 0xB9 &&
          rfid.uid.uidByte[2] == 0xB7 &&
          rfid.uid.uidByte[3] == 0x03) {


        Serial.println("TAG 1 AUTHORIZED");


        // Unlock container 1
        servo1.write(90);

        servo1Unlocked = true;

        authorizedTag = true;


        Serial.println("CONTAINER 1 UNLOCKED");


        // Send updated status
        sendDataToWebsite();
      }


      // ==================================================
      // TAG 2 → SERVO 2
      // UID = 9A 24 0F 02
      // ==================================================

      else if (rfid.uid.size == 4 &&
               rfid.uid.uidByte[0] == 0x9A &&
               rfid.uid.uidByte[1] == 0x24 &&
               rfid.uid.uidByte[2] == 0x0F &&
               rfid.uid.uidByte[3] == 0x02) {


        Serial.println("TAG 2 AUTHORIZED");


        // Unlock container 2
        servo2.write(90);

        servo2Unlocked = true;

        authorizedTag = true;


        Serial.println("CONTAINER 2 UNLOCKED");


        // Send updated status
        sendDataToWebsite();
      }


      // ==================================================
      // UNAUTHORIZED RFID
      // ==================================================

      else {

        Serial.println("UNAUTHORIZED RFID TAG!");

        Serial.println("ACCESS DENIED");


        // Buzzer for 0.5 second
        digitalWrite(BUZZER_PIN, HIGH);

        delay(500);

        digitalWrite(BUZZER_PIN, LOW);


        Serial.println("Unauthorized access alert!");
      }


      // ==================================================
      // ANY RFID SCAN = ACTIVITY
      // ==================================================

      activityDetected = true;

      Serial.println("RFID ACTIVITY RECORDED");

      Serial.println("5-second unnecessary timer cancelled");


      // ==================================================
      // STOP RFID COMMUNICATION
      // ==================================================

      rfid.PICC_HaltA();

      rfid.PCD_StopCrypto1();

      delay(500);
    }


    // ==================================================
    // 5 SECOND INACTIVITY CHECK
    // ==================================================

    if (!unnecessaryCounted &&
        millis() - doorOpenTime >= WARNING_TIME) {


      // No IR activity AND no RFID activity
      if (!activityDetected) {


        unnecessaryCount++;


        unnecessaryCounted = true;


        Serial.println();

        Serial.println("================================");

        Serial.println("NO ACTIVITY FOR 5 SECONDS");

        Serial.println("UNNECESSARY OPENING");

        Serial.println("================================");


        Serial.print("Unnecessary count: ");

        Serial.println(unnecessaryCount);


        // Buzzer stays ON
        digitalWrite(BUZZER_PIN, HIGH);


        // Update LCD
        updateLCD();


        // Send updated data
        sendDataToWebsite();
      }
    }
  }


  // ==================================================
  // FRIDGE DOOR CLOSED
  // ==================================================

  else {


    if (doorWasOpen) {


      Serial.println();

      Serial.println("================================");

      Serial.println("FRIDGE DOOR CLOSED");

      Serial.println("================================");


      // Lock both containers
      servo1.write(0);

      servo2.write(0);


      servo1Unlocked = false;

      servo2Unlocked = false;


      Serial.println("CONTAINER 1 LOCKED");

      Serial.println("CONTAINER 2 LOCKED");


      // Buzzer OFF
      digitalWrite(BUZZER_PIN, LOW);


      // Reset variables
      doorWasOpen = false;

      activityDetected = false;

      unnecessaryCounted = false;


      // Update LCD
      updateLCD();


      // Send updated data
      sendDataToWebsite();
    }
  }


  // Small loop delay
  delay(50);
}