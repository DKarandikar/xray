## IP Addresses

In my setup the phone was 192.168.4.19

The hue was 192.168.4.16

And the echo was 192.168.4.2

## Pipeline

1. Use TCPCapture script to get traffic
2. Run `PcapBurstification.py` to seperate captured traffic into >1-sec interval bursts
3. Run `BurstFeatureExtraction.py` to extract features for bursts