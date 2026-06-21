#include <Arduino.h>
#include "config.h"
#include "packet.h"
#include "sampler.h"

enum State { IDLE, STREAMING };

State    firmwareState   = IDLE;
uint8_t  packetCounter   = 0;
uint32_t lastSampleTime  = 0;
uint32_t lastLedTime     = 0;
uint32_t totalPackets    = 0;
bool     ledOn           = false;
char     cmdBuf[32];
uint8_t  cmdIdx          = 0;

void handleCommand(const char* cmd) {
  if (strcmp(cmd, CMD_WHORU) == 0) {
    Serial.println(RESP_IDENTITY);
  } else if (strcmp(cmd, CMD_START) == 0) {
    firmwareState  = STREAMING;
    packetCounter  = 0;
    totalPackets   = 0;
    lastSampleTime = micros();
    Serial.println(RESP_STARTED);
  } else if (strcmp(cmd, CMD_STOP) == 0) {
    firmwareState = IDLE;
    Serial.println(RESP_STOPPED);
  } else if (strcmp(cmd, CMD_STATUS) == 0) {
    Serial.print("STATE:");
    Serial.print(firmwareState == STREAMING ? "STREAMING" : "IDLE");
    Serial.print(",PACKETS:");
    Serial.print(totalPackets);
    Serial.print(",UPTIME:");
    Serial.println(millis());
  } else {
    Serial.print("UNKNOWN:");
    Serial.println(cmd);
  }
}

void setup() {
  Serial.begin(BAUD_RATE);
  while (!Serial && millis() < 3000);
  pinMode(LED_PIN, OUTPUT);
  initADC();
  Serial.println("========================================");
  Serial.println("  NEUROBRIGHT EEG FIRMWARE v1.0");
  Serial.println("  Commands: WHORU | START | STOP | STATUS");
  Serial.println("  Waiting for Python...");
  Serial.println("========================================");
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      if (cmdIdx > 0) {
        cmdBuf[cmdIdx] = '\0';
        handleCommand(cmdBuf);
        cmdIdx = 0;
        memset(cmdBuf, 0, 32);
      }
    } else if (cmdIdx < 31) {
      cmdBuf[cmdIdx++] = c;
    }
  }

  if (firmwareState == STREAMING) {
    uint32_t now = micros();
    if (now - lastSampleTime >= SAMPLE_INTERVAL) {
      lastSampleTime = now;
      uint16_t ch1, ch2, ch3;
      readChannels(ch1, ch2, ch3);
      sendPacket(ch1, ch2, ch3, packetCounter++);
      totalPackets++;
    }
  }

  uint32_t now = millis();
  uint32_t interval = (firmwareState == STREAMING)
    ? LED_BLINK_FAST : LED_BLINK_SLOW;
  if (now - lastLedTime >= interval) {
    lastLedTime = now;
    ledOn = !ledOn;
    digitalWrite(LED_PIN, ledOn ? HIGH : LOW);
  }
}
