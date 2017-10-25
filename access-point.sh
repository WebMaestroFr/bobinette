#!/bin/bash
# https://gist.github.com/Lewiscowles1986/fecd4de0b45b2029c390

APSSID="Bobinette"
APPASS="Chevillette"

apt-get remove --purge hostapd -yqq
apt-get install hostapd dnsmasq -yqq

mv -n -v /etc/dnsmasq.conf /etc/dnsmasq.conf.bak
cp /etc/dnsmasq.conf.bak /etc/dnsmasq.conf
cat > /etc/dnsmasq.conf <<EOF
interface=wlan0
dhcp-range=10.0.0.2,10.0.0.5,255.255.255.0,12h
EOF

# mv -n -v /etc/hostapd/hostapd.conf /etc/hostapd/hostapd.conf.bak
# cp /etc/hostapd/hostapd.conf.bak /etc/hostapd/hostapd.conf
cat > /etc/hostapd/hostapd.conf <<EOF
interface=wlan0
hw_mode=g
channel=10
auth_algs=1
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_pairwise=CCMP
rsn_pairwise=CCMP
wpa_passphrase=$APPASS
ssid=$APSSID
ieee80211n=1
wmm_enabled=1
ht_capab=[HT40][SHORT-GI-20][DSSS_CCK-40]
EOF

mv -n -v /etc/default/hostapd /etc/default/hostapd.bak
cp /etc/default/hostapd.bak /etc/default/hostapd
sed -i -- 's/#DAEMON_CONF=""/DAEMON_CONF="\/etc\/hostapd\/hostapd.conf"/g' /etc/default/hostapd

mv -n -v /etc/network/interfaces /etc/network/interfaces.bak
cp /etc/network/interfaces.bak /etc/network/interfaces
sed -i -- 's/allow-hotplug wlan0//g' /etc/network/interfaces
sed -i -- 's/iface wlan0 inet manual//g' /etc/network/interfaces
sed -i -- 's/    wpa-conf \/etc\/wpa_supplicant\/wpa_supplicant.conf//g' /etc/network/interfaces
cat >> /etc/network/interfaces <<EOF
allow-hotplug wlan0
iface wlan0 inet static
	address 10.0.0.1
	netmask 255.255.255.0
	network 10.0.0.0
	broadcast 10.0.0.255

EOF

mv -n -v /etc/dhcpcd.conf /etc/dhcpcd.conf.bak
cp /etc/dhcpcd.conf.bak /etc/dhcpcd.conf
echo "denyinterfaces wlan0" >> /etc/dhcpcd.conf

systemctl enable hostapd
systemctl enable dnsmasq

sudo service hostapd start
sudo service dnsmasq start