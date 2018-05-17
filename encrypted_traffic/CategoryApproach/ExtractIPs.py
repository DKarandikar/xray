''' Specify pcap in /pcaps by name and produces a .txt. of all IPs for a specified host (or for all) '''

import sys
import os


def getData(ip):
	
	if ip != "n":
		os.system("tcpdump -r pcaps/" + sys.argv[1] + " -w pcaps/" + sys.argv[1] + "Host" + ip.split(".")[3] + " host " + ip)
		filename = sys.argv[1] + "Host" + ip.split(".")[3]
	else:
		filename = sys.argv[1]
	
	os.system("tshark -r pcaps/" + filename + " -q -z ip_hosts,tree > statistics/" + filename + "Statistics.txt")
	
	
	
	with open("statistics/" + filename + "Statistics.txt") as f:
		content = f.readlines()
	
	content = [x.strip() for x in content] 
	
	result = ""
	
	for line in range(6, len(content)-2):
		result += content[line].split(" ")[0]
		result += "\n"
	
	with open("ips/" + filename + "IPs.txt", "w") as file:
		file.write(result)

if (sys.argv[2] == "all"):
	getData("192.168.4.2")
	getData("192.168.4.16")
	getData("192.168.4.19")
else:
	IP = input("Filter by host IP? (n or IP)")
	getData(IP)

