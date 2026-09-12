<img width="960" height="1280" alt="image" src="https://github.com/user-attachments/assets/57ec77f5-aa48-4da3-bd5c-f92ca61807bb" /><img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# Medusa Smart fridge 


## Basic Details
### Team Name: Slytherin


### Team Members
- Team Lead: Sreelakshmi PG - Toc H Institute of Science and Technology
- Member 2: Muhammed Salman MS - Toc H Institute of Science and Technology


### Project Description
Medusa Smart fridge is an access control system for your fridge, which are a few words that don't belong together and still we are introducing RFID controled lockers to lock your sweet treats. This is inspired from our favorite  F.R.I.E..N.D.S character Ross who's sandwich was stolen.

### The Problem (that doesn't exist)
There's a thing about food, the problems we face are never ending this is a small list of problems we are solving
1. Well for starters we dont want your roommate also known as your sibling sometimes eating your chocolates.
2. Did you know that opening the fridge for no apparent reason is a shared timepass among the human species? Here we are tracking your fridge visits like your strava depends on it.

### The Solution (that nobody asked for)
Well for starters we dont want your roommate (also known as your sibling sometimes) eating YOUR chocolates.

## Technical Details
### Technologies/Components Used
For Software:
- C/C++ (Arduino), HTML, CSS, JavaScript
- Arduino Framework, ESP32 Wi-Fi Web Server
Libraries used:
- WiFi.h – ESP32 Wi-Fi connectivity
  WebServer.h – Web server functionality
  Wire.h – I²C communication
  SPI.h – SPI communication
  LiquidCrystal_I2C.h – LCD display control
  MFRC522.h – RFID reader interface
  ESP32Servo.h – Servo motor control
- Arduino IDE, Git/GitHub, Vercel, Web Browser

For Hardware:
- ESP32 Development Board – Main microcontroller with built-in Wi-Fi
  RC522 RFID Reader – Contactless RFID authentication for individual users
  RFID Tags/Cards – Unique identification for each authorized user
  SG90 Servo Motors – Electronic locking/unlocking mechanism for individual storage containers
  Magnetic Reed Switch – Detects whether the refrigerator door is open or closed
  16×2 I²C LCD Display – Displays access/status information and refrigerator activity
  LED indicators – Provides visual status indication
  Jumper Wires – Component interconnections
  Breadboard – Prototyping and circuit assembly
  5V Power Supply/USB Power Bank – Powers the ESP32 and connected components
-Controller: ESP32, 32-bit dual-core microcontroller with Wi-Fi and Bluetooth
  RFID: RC522, 13.56 MHz contactless RFID communication
  Servo: SG90, approximately 180° rotational control
  Display: 16×2 LCD with I²C interface
  Door sensing: Magnetic reed switch
  Communication: Wi-Fi for web-based monitoring
  Authentication: Unique RFID-based user identification
  Locking: Servo-controlled individual storage compartments
- Arduino IDE
  USB cable
  Breadboard
  Jumper wires
  Screwdriver/basic assembly tools
  Computer/laptop for programming
  Wi-Fi network for web connectivity
  Git/GitHub for source-code management
  Vercel for website deployment
### Implementation
For Software:
# Installation
[commands]

# Run
[commands]

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![Screenshot1](Add screenshot 1 here with proper name)
*Add caption explaining what this shows*

![Screenshot2](Add screenshot 2 here with proper name)
*Add caption explaining what this shows*

![Screenshot3](Add screenshot 3 here with proper name)
*Add caption explaining what this shows*

# Diagrams
![Workflow](Add your workflow/architecture diagram here)
*Add caption explaining your workflow*

For Hardware:

# Schematic & Circuit

Circuit Diagram: Complete hardware connection diagram of the Medussa Smart Fridge system, showing the ESP32, RFID reader, servo motors, LCD display, and reed switch.

Circuit Connections: Pin-to-pin wiring and interfacing of all major components with the ESP32.

Hardware Setup: Overall circuit configuration used for RFID-based access control and fridge monitoring.
<img width="393" height="399" alt="image" src="https://github.com/user-attachments/assets/14c32152-1c45-4056-a6df-dc59f1ea9488" />
The ESP32 acts as the main controller of the Medussa Smart Fridge. The RC522 RFID
reader scans the user's RFID card and sends the card ID to the ESP32 through SPI
communication. If the card is authorized, the ESP32 activates the corresponding
SG90 servo motor to unlock the user's storage container. The reed switch detects
whether the refrigerator door is open or closed, while the I2C LCD displays access
and system status. The ESP32 uses Wi-Fi to send monitoring data to the web dashboard.

![Schematic](Add your schematic diagram here)
                 MEDUSSA – SMART FRIDGE
                       ┌───────────┐
                       │   ESP32   │
                       │           │
        ┌──────────────┤           ├──────────────┐
        │              │           │              │
        │              └───────────┘              │
        │                     │                    │
        ▼                     ▼                    ▼
   ┌─────────┐          ┌──────────┐        ┌────────────┐
   │  RC522  │          │  SG90    │        │ 16×4 LCD   │
   │  RFID   │          │  Servo(s)│        │    I²C     │
   └─────────┘          └──────────┘        └────────────┘
        │                     │                    │
        │ RFID Authentication │ Container Lock    │ Status
        │                     │                    │
        └─────────────────────┼────────────────────┘
                              │
                         ┌──────────┐
                         │  Reed    │
                         │  Switch  │
                         └──────────┘
                              │
                         Door Detection

                    ESP32 ─── Wi-Fi ─── Web Dashboard

Figure: Working schematic of the Medussa Smart Fridge, where the RC522 authenticates users through RFID, the ESP32 processes the access request and controls the servo-based container locks, while the reed switch detects door activity and the LCD displays system status. The ESP32 also transmits the data via Wi-Fi to the web dashboard for monitoring.

# Build Photos
<img width="960" height="1280" alt="image" src="https://github.com/user-attachments/assets/5372789d-bb58-4f1e-8971-0bfeb6340ff3" />


<img width="960" height="1280" alt="image" src="https://github.com/user-attachments/assets/974b6295-7b7e-42f6-856b-8a9606a96e2b" />


<img width="960" height="1280" alt="image" src="https://github.com/user-attachments/assets/c3d84081-fe7f-47b7-b8bf-13359d9f28e9" />


### Project Demo
# Video
https://drive.google.com/drive/folders/1GmYnxxvGMSgtnrNZs30n4BuHJVZHcn1G



## Team Contributions
- Muhammed Salman MS: [wiring and cooding]
- Sreelakshmi PG: [integration and website]


---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



