# Bobinette

## Start Development (`bobinette-dev`)
```
cd ~/bobinette
```
##### Server
```
npm run server
```
##### Client
```
npm run client
```

## Build

Download the [last image of Raspbian Lite](https://downloads.raspberrypi.org/raspbian_lite_latest).

### Install Raspbian on SD Card
Find out SD Card mounting index (`X`).
```
sudo diskutil list
```
Burn the image.
```
sudo diskutil unmountDisk /dev/diskX
sudo dd bs=1m if=path/to/raspbian-jessie-lite.img of=/dev/rdiskX
sudo diskutil unmountDisk /dev/diskX
```
Boot the SD Card on a Raspberry Pi.

### Connect the Pi
```
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```
Write network configuration at the end of the file, save and exit (`ctrl+X`).
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

### Update Package Manager and Install Git
```
sudo apt-get update
sudo apt-get install -y git
git config --global credential.helper 'cache --timeout=28800'
```

### Install NodeJS
Remove Debian packages.
```
sudo apt-get remove --purge npm node nodejs
```
##### Raspberry Pi Zero (`bobinette`)
```
wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v6.9.1.sh | bash
```
##### Raspberry Pi 3 (`bobinette-dev`)
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Update NPM
```
npm install -g npm@4.6.1
```

### Install Repository
```
git clone http://github.com/WebMaestroFr/bobinette.git
cd bobinette
```
##### Raspberry Pi 3 (`bobinette-dev`)
```
git checkout bobinette-dev
```

### Install Application
```
npm install
```

### Run On Boot (`bobinette`)
```
sudo nano /etc/rc.local
```
Write command at the end of the file, save and exit (`ctrl+X`).
```
npm start --prefix ~/bobinette/server
```