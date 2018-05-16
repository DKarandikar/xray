from os import walk
from scapy.all import *
import statistics, csv, pickle, pyshark

listIPs = pickle.load( open( "ips.p", "rb"))
listProtos = pickle.load( open( "protos.p", "rb"))

#print(listIPs)
#print(listProtos)

f = []
for (d, dn, filenames) in walk("bursts/"):
    f.extend(sorted(filenames))
    break

# Setup csv file

output = open("features.csv",'a')

writer = csv.writer(output)

writer.writerow(['filename','class','maxLen','minLen','meanLen', 'medianLen'] + listIPs + ["Protocol: " + str(p) for p in listProtos])

# Extract features



for file in f:
    print("Extracting features: " + file)
    row = []
    row.append(file)
    row.append("")

    lengths = [0]
    lengths.extend([len(p) for p in PcapReader("bursts/"+file)])
    #print(lengths)

    row.append(max(lengths))
    row.append(min(lengths))
    row.append(statistics.mean(lengths))
    row.append(statistics.median(lengths))

   

    pkts = pyshark.FileCapture("bursts/"+file)

    #print(pkts)

    test = set()
    currentProtos = set()

    for p in pkts:
        if 'IP' in p:
            try:
                source = str(p['ip'].src)
                destination = str(p['ip'].dst)
                test.add(source)
                test.add(destination)

                currentProtos.add(p['ip'].proto)
            except AttributeError:
                print("Attribute error")
    
    #print(test)
    #print(currentProtos)
    
    for IP in listIPs:
        if IP in test:
            row.append(1)
        else:
            row.append(0)

    for proto in listProtos:
        if str(proto) in currentProtos:
            row.append(1)
        else:
            row.append(0)

    writer.writerow(row)
        
output.close()
    



