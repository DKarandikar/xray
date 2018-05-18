import os
from scapy.all import *
import statistics, csv, pickle, pyshark

# "To" statistics are to Amazon, and "From" are from Amazon

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
    
    writer.writerow(['filename','burstNo',
                     'lengthTo','lengthFrom',
                     'maxLenTo','minLenTo','meanLenTo', 'medianLenTo','varTo',
                     'maxLenFrom','minLenFrom','meanLenFrom', 'medianLenFrom', 'varFrom',
                     'meanLenToNo54', 'meanLenFromNo54', 'burstlength'])
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

    # Ignore bursts already done
    if not newFile:
        if file in files:
            print("Already Done")
            continue

    # Ignore noise files
    if os.path.getsize("bursts/"+file) < 30000:
        print("Noise")
        continue
    
    # Name
    
    row = []
    row.append(file.split("burst")[0])
    row.append(file.split("burst")[1].split(".")[0])

    # Lengths

    row.append("")
    row.append("")

    # Length Statistics    

    lengthsTo = []
    lengthsFrom = []

    pkts = pyshark.FileCapture("bursts/"+file)

    
    #initialTime = float(pkts[0].sniff_timestamp)
    #finalTime = float(pkts[-1].sniff_timestamp)

    init = True

    for p in pkts:
        if 'IP' in p:
            try:
                if init:
                    initialTime = float(p.sniff_timestamp)
                    init = False
                finalTime = float(p.sniff_timestamp)
                if p['ip'].src == "192.168.4.2":
                    lengthsTo.append(int(p.length))
                else:
                    lengthsFrom.append(int(p.length))
            except AttributeError:
                print("Attribute error")

    
    
    print(lengthsTo)
    print(lengthsFrom)

    row.append(max(lengthsTo))
    row.append(min(lengthsTo))
    row.append(statistics.mean(lengthsTo))
    row.append(statistics.median(lengthsTo))
    row.append(statistics.variance(lengthsTo))

    
    row.append(max(lengthsFrom))
    row.append(min(lengthsFrom))
    row.append(statistics.mean(lengthsFrom))
    row.append(statistics.median(lengthsFrom))
    row.append(statistics.variance(lengthsFrom))

    lengthsToNo54 = list(filter(lambda a: a != 54, lengthsTo))
    lengthsFromNo54 = list(filter(lambda a: a != 54, lengthsFrom))

    row.append(statistics.mean(lengthsToNo54))
    row.append(statistics.mean(lengthsFromNo54))
    
    row.append(finalTime-initialTime)

    # Write row

    writer.writerow(row)
        
output.close()
    



