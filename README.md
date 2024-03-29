# Bobinette
Physiognomist Device and Services

## Run Application

#### Start Server
```
python3 -m bobinette
```
Application is served at [bobinette.local](http://bobinette.local) (Pi Zero) or [bobinette-dev.local](http://bobinette-dev.local) (Pi 3).
Capture starts before first request.

#### Clear Data
```
sudo rm bobinette/data/faces.xml && sudo rm bobinette/data/face-v1.sqlite3
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
sudo apt-get update -y
sudo apt-get install -y git
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
bash ./install.sh
```

### Run On Boot (`bobinette`)
```
sudo nano /etc/rc.local
```
Write command before `exit 0`, save and exit (`ctrl+X`).
```
python3 -m bobinette
```