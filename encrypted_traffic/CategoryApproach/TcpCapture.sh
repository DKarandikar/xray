echo "Type the name of the file"
read file

tcpdump -i wlan0 -w - | tee pcaps/$file | tcpdump -r -
