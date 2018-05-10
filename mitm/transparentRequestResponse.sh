# setup for transparent mitmproxy

# Enable IP forwarding
sysctl -w net.ipv4.ip_forward=1
sysctl -w net.ipv6.conf.all.forwarding=1

# Disable ICMP redirects
sysctl -w net.ipv4.conf.all.send_redirects=0 

# Setup iptables rule set
iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8080
iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 443 -j REDIRECT --to-port 8080
ip6tables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8080
ip6tables -t nat -A PREROUTING -i wlan0 -p tcp --dport 443 -j REDIRECT --to-port 8080

#Run it
echo "Type the name of the app"
read app
echo "Type the company"
read company

jq '.app = $newVal' --arg newVal $app mitm-config.json > tmp.$$.json && mv tmp.$$.json mitm-config.json
jq '.company = $newVal2' --arg newVal2 $company mitm-config.json > tmp.$$.json && mv tmp.$$.json mitm-config.json

mitmdump -T --host -s mitm-saveRR.py -p 8080