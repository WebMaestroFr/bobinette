#!/bin/bash

cd "$(dirname "$0")"

BLUE="\033[0;34m"
BLANK="\033[0m"

REVCODE=$(sudo cat /proc/cpuinfo | grep 'Revision' | awk '{print $3}' | sed 's/^ *//g' | sed 's/ *$//g')

printf "\n${BLUE}Updating Package Manager ...${BLANK}\n"
sudo apt-get update -y
printf "\n${BLUE}Upgrading Distribution ...${BLANK}\n"
sudo apt-get dist-upgrade -y -q
printf "\n${BLUE}Upgrading Packages ...${BLANK}\n"
sudo apt-get upgrade -y -q

printf "\n${BLUE}Installing Dependencies ...${BLANK}\n"
sudo apt-get install -y python3-dev python3-pip
sudo apt-get install -y build-essential cmake pkg-config
sudo apt-get install -y libjpeg-dev libtiff5-dev libjasper-dev libpng12-dev
sudo apt-get install -y libavcodec-dev libavformat-dev libswscale-dev libv4l-dev libxvidcore-dev libx264-dev
sudo apt-get install -y libatlas-base-dev gfortran

printf "\n${BLUE}Initializing Submodules ...${BLANK}\n"
git submodule init
printf "\n${BLUE}Updating Submodules ...${BLANK}\n"
git submodule update

printf "\n${BLUE}Building OpenCV ...${BLANK}\n"
cd libraries/opencv_build
cmake \
-D BUILD_opencv_java=OFF \
-D BUILD_PYTHON_SUPPORT=ON \
-D CMAKE_BUILD_TYPE=RELEASE \
-D CMAKE_INSTALL_PREFIX=/usr/local \
-D INSTALL_PYTHON_EXAMPLES=ON \
-D OPENCV_EXTRA_MODULES_PATH=../opencv_contrib/modules \
-D WITH_TBB=ON \
-D WITH_V4L=ON \
../opencv
if [ "$REVCODE" = "a02082" ] || [ "$REVCODE" = "a22082" ]; then
    # Raspberry Pi 3 Model B
    make -j4
else
    # Raspberry Pi Zero W or other
    make
fi
sudo make install
sudo ldconfig
cd ../..

printf "\n${BLUE}Cleaning Up Packages ...${BLANK}\n"
sudo apt-get autoremove -y
sudo apt-get clean -y

printf "\n${BLUE}Installing Server Requirements ...${BLANK}\n"
sudo -H pip3 install --upgrade -r requirements.txt
sudo -H pip3 install --upgrade pip picamera[array] RPi.GPIO

printf "\n${BLUE}Installing Node${BLANK}\n"
if [ "$REVCODE" = "0x9000C1" ]; then
    # Raspberry Pi Zero W
    wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v6.9.1.sh | bash
else
    # Raspberry Pi 3 Model B or other
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

printf "\n${BLUE}Updating Node Package Manager ...${BLANK}\n"
sudo npm update -g

printf "\n${BLUE}Installing Client Application ...${BLANK}\n"
cd application
npm install
printf "\n${BLUE}Building Client Application ...${BLANK}\n"
npm run build
cd ..

printf "\n${BLUE}Setting Up Access Point ...${BLANK}\n"
sudo bash ./access-point.sh

printf "\n${BLUE}All Done !${BLANK}\n"
sudo reboot