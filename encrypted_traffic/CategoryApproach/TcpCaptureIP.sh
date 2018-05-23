echo "Type the IP address"
read ip

echo "Type the name of the file"
read file

tcpdump host $ip -i wlan0 -w - | tee pcaps/$file | tcpdump -r -
