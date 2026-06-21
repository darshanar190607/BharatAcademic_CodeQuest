#pragma once
#include <Arduino.h>
#include "config.h"

// 16-byte binary packet:
// [0]  SYNC1  = 0xC7
// [1]  SYNC2  = 0x7C
// [2]  CH1_HI
// [3]  CH1_LO
// [4]  CH2_HI
// [5]  CH2_LO
// [6]  CH3_HI
// [7]  CH3_LO
// [8-13] PAD = 0x00
// [14] COUNTER (0-255 wrapping)
// [15] END = 0x01

inline void sendPacket(
    uint16_t ch1, uint16_t ch2, uint16_t ch3, uint8_t counter) {
  uint8_t buf[PACKET_LENGTH];
  buf[0]  = SYNC_BYTE_1;
  buf[1]  = SYNC_BYTE_2;
  buf[2]  = (ch1 >> 8) & 0xFF;
  buf[3]  = ch1 & 0xFF;
  buf[4]  = (ch2 >> 8) & 0xFF;
  buf[5]  = ch2 & 0xFF;
  buf[6]  = (ch3 >> 8) & 0xFF;
  buf[7]  = ch3 & 0xFF;
  buf[8]  = 0x00; buf[9]  = 0x00; buf[10] = 0x00;
  buf[11] = 0x00; buf[12] = 0x00; buf[13] = 0x00;
  buf[14] = counter;
  buf[15] = END_BYTE;
  Serial.write(buf, PACKET_LENGTH);
}
