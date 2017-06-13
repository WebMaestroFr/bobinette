# Bobinette

## Prepare New Image

### Install Raspbian on SD Card
Download the [last image of Raspbian Lite](https://downloads.raspberrypi.org/raspbian_lite_latest).
Find out SD Card mounting index (`X`).
```
sudo diskutil list
```
Burn the image.
```
sudo diskutil unmountDisk /dev/diskX
sudo dd bs=1m if=YYYY-MM-DD-raspbian-jessie-lite.img of=/dev/rdiskX
sudo diskutil unmountDisk /dev/diskX
```
Boot the Pi on the SD Card.

### Set WiFi up
```
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```
Add network configuration add the end of the file.
```
network={
    ssid="network_name"
    psk="network_passkey"
}
```

### Configure Raspbian
```
sudo raspi-config
```
* Set _Hostname_ to `bobinette` (Pi Zero) or `bobinette-dev` (Pi 3)
* Set "Console Autologin" as _Boot Option_
* Enable "Camera" and "SSH" _Interfacing Options_
* _Expand Filesystem_

### Update Package Manager and Install Git
```
sudo apt-get update
sudo apt-get install -y git
```

### Install NodeJS
##### Raspberry Pi 3
```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```
##### Raspberry Pi Zero
```
wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v.last.sh | bash
sudo apt-get install -y nodejs
```

### Install Repository
```
git clone http://github.com/WebMaestroFr/bobinette.git
cd bobinette
npm install
```