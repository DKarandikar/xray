# Undo setup for transparent mitmproxy

# Re-enable ICMP redirects
sysctl -w net.ipv4.conf.all.send_redirects=1

# Remove iptables rule set
iptables -t nat -D PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8080
iptables -t nat -D PREROUTING -i wlan0 -p tcp --dport 443 -j REDIRECT --to-port 8080
ip6tables -t nat -D PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8080
ip6tables -t nat -D PREROUTING -i wlan0 -p tcp --dport 443 -j REDIRECT --to-port 8080