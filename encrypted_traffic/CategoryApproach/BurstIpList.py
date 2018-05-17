from os import walk
from scapy.all import *
import pickle

# Get lists of IPs and Protocols for use as headers"

f = []
for (d, dn, filenames) in walk("bursts/"):
    f.extend(sorted(filenames))
    break

ips = set()
protos = set()

for file in f:
    print("Pre-processing " + file)
    test = set(p[IP].src for p in PcapReader("bursts/"+file) if IP in p)
    ips |= test
    print(test)
    ips |= set(p[IP].dst for p in PcapReader("bursts/"+file) if IP in p)
    #print(ips)
    protos |= set(p[IP].proto for p in PcapReader("bursts/"+file) if IP in p)
    

pickle.dump(sorted(list(ips)), open("ips.p", "wb"))
pickle.dump(sorted(list(protos)), open("protos.p", "wb"))
