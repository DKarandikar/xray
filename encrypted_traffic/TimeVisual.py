from scapy.all import *
import matplotlib.pyplot as plt

a = rdpcap("/home/pi/xray/encrypted_traffic/pcaps/HueAlexa6")

times = []

for pkt in a:
    times += [pkt.time]

B = 50
minv = min(times)
maxv = max(times)

bincounts=[]
for i in range(B+1):
    bincounts.append(0)

for d in times:
    b = int((d-minv) / (maxv - minv) * B)
    bincounts[b] += 1


plt.hist(bincounts,50)
plt.show()
