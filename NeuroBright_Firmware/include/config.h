#pragma once

#define BAUD_RATE         230400
#define SAMPLE_RATE       500
#define N_CHANNELS        3
#define SAMPLE_INTERVAL   2000       // microseconds = 1/500Hz

#define ADC_RESOLUTION    14
#define ADC_MAX_VALUE     16383
#define ADC_REF_VOLTAGE   3.3f

#define CH1_PIN           A0         // Fp1 left forehead
#define CH2_PIN           A1         // Fp2 right forehead
#define CH3_PIN           A2         // A1 left earlobe

#define SYNC_BYTE_1       0xC7
#define SYNC_BYTE_2       0x7C
#define END_BYTE          0x01
#define PACKET_LENGTH     16

#define CMD_WHORU         "WHORU"
#define CMD_START         "START"
#define CMD_STOP          "STOP"
#define CMD_STATUS        "STATUS"

#define RESP_IDENTITY     "UNO-R4-NEUROBRIGHT"
#define RESP_STARTED      "STREAMING"
#define RESP_STOPPED      "STOPPED"

#define LED_PIN           LED_BUILTIN
#define LED_BLINK_FAST    100        // ms — streaming
#define LED_BLINK_SLOW    1000       // ms — idle
