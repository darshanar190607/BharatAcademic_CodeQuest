#pragma once
#include <Arduino.h>
#include "config.h"

inline void initADC() {
  analogReadResolution(ADC_RESOLUTION);
  analogReference(AR_DEFAULT);
}

inline void readChannels(
    uint16_t &ch1, uint16_t &ch2, uint16_t &ch3) {
  ch1 = analogRead(CH1_PIN);
  ch2 = analogRead(CH2_PIN);
  ch3 = analogRead(CH3_PIN);
}

inline float adcToMicrovolts(uint16_t raw) {
  return ((float(raw) / ADC_MAX_VALUE) - 0.5f)
          * ADC_REF_VOLTAGE * 1000000.0f / 1000.0f;
}

inline bool isSignalHealthy(
    uint16_t ch1, uint16_t ch2, uint16_t ch3) {
  return (ch1 > 100 && ch1 < 16200) &&
         (ch2 > 100 && ch2 < 16200) &&
         (ch3 > 100 && ch3 < 16200);
}
