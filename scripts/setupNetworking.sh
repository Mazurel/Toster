#!/bin/sh

# Installation based on https://raspberrypi.stackexchange.com/questions/108592/use-systemd-networkd-for-general-networking/108593#108593

echo Please ensure that internet is working, otherwise this script may break your device
echo Press enter to continue ...
read 

echo Removing Raspberry pi\' default network managers

apt --autoremove purge ifupdown dhcpcd5 isc-dhcp-client isc-dhcp-common rsyslog
apt-mark hold ifupdown dhcpcd5 isc-dhcp-client isc-dhcp-common rsyslog raspberrypi-net-mods openresolv
rm -rf /etc/network /etc/dhcp

echo Setting up Systemd Networkd

apt --autoremove purge avahi-daemon
apt-mark hold avahi-daemon libnss-mdns
apt install libnss-resolve
ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
systemctl enable systemd-networkd.service systemd-resolved.service

echo Configuring Systemd Networkd

# Fix possible dns errors
echo "DNSSEC=no" >> /etc/resolv.conf 

# Setup dynamic ethernet connection
cat > /etc/systemd/network/20-wired.network <<EOF
[Match]
Name=e*
Type=ether

[Network]
LLMNR=no
LinkLocalAddressing=no
MulticastDNS=yes
DHCP=ipv4
EOF

# Setup wifi for hotspot
cat > /etc/systemd/network/08-wlan0.network <<EOF
[Match]
Name=wlan0
[Network]
Address=192.168.1.1/24
MulticastDNS=yes
DHCPServer=yes
IPMasquerade=yes
DHCPServer=yes
[DHCPServer]
DNS=84.200.69.80 1.1.1.
EOF

# Ensure that it is readable
chmod +r /etc/systemd/network/20-wired.network /etc/systemd/network/08-wlan0.network

# Setup wpa supplicant
# Based on: https://raspberrypi.stackexchange.com/questions/88214/setting-up-a-raspberry-pi-as-an-access-point-the-easy-way/88234#88234
cat > /etc/wpa_supplicant/wpa_supplicant-wlan0.conf <<EOF
country=DE
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="Robot"
    mode=2
    frequency=2437
    #key_mgmt=NONE   # uncomment this for an open hotspot
    key_mgmt=WPA-PSK
    proto=RSN WPA
    psk="password"
}
EOF

chmod 600 /etc/wpa_supplicant/wpa_supplicant-wlan0.conf
systemctl disable wpa_supplicant.service
systemctl enable wpa_supplicant@wlan0.service
rfkill unblock wlan


echo Finished network setup
exit
