#!/bin/bash

cp /etc/dnsmasq.conf.bak /etc/dnsmasq.conf

rm /etc/hostapd/hostapd.conf

cp /etc/default/hostapd.bak /etc/default/hostapd

cp /etc/network/interfaces.bak /etc/network/interfaces

cp /etc/dhcpcd.conf.bak /etc/dhcpcd.conf

systemctl disable hostapd
systemctl disable dnsmasq

service hostapd stop
service dnsmasq stop