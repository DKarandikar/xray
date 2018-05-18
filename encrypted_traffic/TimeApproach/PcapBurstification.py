from scapy.all import *

try:
        a = rdpcap("/home/pi/xray/encrypted_traffic/TimeApproach/pcaps/" + sys.argv[1])
except:
        Print("Please give a filename as argument")

nextPcap = []
times = []

timeInterval = 1.0
burstNumber = 1

currentTime = a[0].time

for pkt in a:
        if (pkt.time - currentTime) < timeInterval:
                nextPcap.append(pkt)
                currentTime = pkt.time
        else:
                wrpcap("/home/pi/xray/encrypted_traffic/TimeApproach/bursts/" + sys.argv[1] + "burst" + str(burstNumber) + ".pcap", nextPcap)
                burstNumber += 1
                currentTime = pkt.time
                nextPcap = [pkt]

wrpcap("/home/pi/xray/encrypted_traffic/TimeApproach/bursts/" + sys.argv[1] + "burst" + str(burstNumber) + ".pcap", nextPcap)
