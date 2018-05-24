## IP Addresses

In my setup the phone was 192.168.4.19

The hue was 192.168.4.16

And the echo was 192.168.4.2

## Pipeline

1. Use TCPCapture script to get traffic
2. Run `PcapBurstification.py` to seperate captured traffic into >1-sec interval bursts
3. (OPTIONAL) Run `BurstIpList.py` to extract relevant IPs and protocols
3.1. If this is run and the IP list changes, need to delete features.csv before next step
4. Run `BurstFeatureExtraction.py` to extract features for bursts
5. (OPTIONAL) Run `RemoveNoiseBursts.py` to get rid of all smaller bursts (background noise <30kB)

## Live capture

To use live capture wireshark (Tshark) has to be configured to not need root to run 