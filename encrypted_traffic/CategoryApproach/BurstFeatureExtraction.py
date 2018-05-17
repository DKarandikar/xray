import os
from scapy.all import *
import statistics, csv, pickle, pyshark



listIPs = pickle.load( open( "ips.p", "rb"))
listProtos = pickle.load( open( "protos.p", "rb"))

#print(listIPs)
#print(listProtos)

# Get names of all burst files

f = []
for (d, dn, filenames) in os.walk("bursts/"):
    f.extend(sorted(filenames))
    break

# Setup csv file

newFile = not os.path.isfile("features.csv")
files =[]

if newFile:
    output = open("features.csv",'a')
    writer = csv.writer(output)
    
    writer.writerow(['filename','class','maxLen','minLen','meanLen', 'medianLen'] + listIPs + ["Protocol: " + str(p) for p in listProtos])
else:
    with open("features.csv", 'r') as csvFile:
        mycsv = csv.reader(csvFile)
        for row in mycsv:
            files.append(row[0])
            
    output = open("features.csv",'a')
    writer = csv.writer(output)
    
# Extract features

for file in f:
    print("Extracting features: " + file)

    if not newFile:
        if file in files:
            print("Already Done")
            continue
    # Name
    
    row = []
    row.append(file)

    # Class
    """ Class labels are specialised to Alexa currently"""

    if "Time" in file and os.path.getsize("bursts/"+file) > 30000:
        row.append("1")
    elif "Weather" in file and os.path.getsize("bursts/"+file) > 30000:
        row.append("2")
    elif "Joke" in file and os.path.getsize("bursts/"+file) > 30000:
        row.append("3")
    elif "Sings" in file and os.path.getsize("bursts/"+file) > 30000:
        row.append("4")
    elif "Conversion" in file and os.path.getsize("bursts/"+file) > 30000:
        row.append("5")
    else:
        row.append("0")

    # Length Statistics    

    lengths = [0]
    lengths.extend([len(p) for p in PcapReader("bursts/"+file)])
    #print(lengths)

    row.append(max(lengths))
    row.append(min(lengths))
    row.append(statistics.mean(lengths))
    row.append(statistics.median(lengths))

   # IP and protocol statistics 

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

    # Write row

    writer.writerow(row)
        
output.close()
    



