echo "Type the name of the file"
read file

tcpdump host 192.168.4.2 -i wlan0 -w - | tee pcaps/$file | tcpdump -r -
