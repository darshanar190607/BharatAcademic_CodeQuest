# NeuroBright Firmware

## Wiring
BioAmp EXG Pill → Arduino UNO R4 Minima:
  VCC → 3.3V
  GND → GND
  OUT → A0 (CH1 Fp1 left forehead)
  OUT → A1 (CH2 Fp2 right forehead)
  OUT → A2 (CH3 A1 left earlobe REF)
  GND ear clip → right earlobe

## Build and Upload (VSCode PlatformIO Extension)
  Open NeuroBright_Firmware/ folder in VSCode
  Click checkmark (Build) in bottom toolbar
  Click arrow (Upload) in bottom toolbar

## Build and Upload (Command Line)
  First add pio to PATH:
  $env:PATH += ";$env:USERPROFILE\.platformio\penv\Scripts"

  Then:
  pio run
  pio run --target upload --upload-port COM5
  pio device monitor --baud 230400

## Test Commands in Serial Monitor
  Type: WHORU    → UNO-R4-NEUROBRIGHT
  Type: START    → STREAMING (binary packets begin)
  Type: STOP     → STOPPED
  Type: STATUS   → STATE:STREAMING,PACKETS:1234,UPTIME:5000

## LED Status
  Fast blink (100ms) = streaming
  Slow blink (1s)    = idle waiting
