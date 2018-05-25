import os, csv
import numpy as np
import pandas as pd
import pyshark
"""
Remember to add the column of 1s in front of it
"""

DEVICE_IP = "192.168.4.2"

BURST_PACKET_NO_CUTOFF = 60
BURST_TIME_INTERVAL = 1.0
FLOW_SIZE_CUTOFF = 10   # Minimum number of packets to be counted as a valid flow


capture = pyshark.LiveCapture(interface='wlan0', only_summaries=True, bpf_filter = "ip host " + DEVICE_IP)

print("Starting capture")

"""
Check for bursts that are big enough (60 packets)
Start a new thread and get the stats on them and test it with the neural network 
"""

nextBurst = []
first = True

for packet in capture.sniff_continuously():
    if first:
        currentTime = float(packet.time)
        first = False
    else:
        if (float(packet.time) - currentTime) < BURST_TIME_INTERVAL:
            nextBurst.append(packet)
            currentTime = float(packet.time)
        else:
            if len(nextBurst) > BURST_PACKET_NO_CUTOFF:
                print("Valid Burst")
            currentTime = float(packet.time)
            nextBurst = [packet]
