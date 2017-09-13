#!/bin/bash

cd "$(dirname "$0")"

BLUE="\033[0;34m"
BLANK="\033[0m"

printf "\n${BLUE}Updating Package Manager ...${BLANK}\n"
sudo apt-get update -y
printf "\n${BLUE}Upgrading Distribution ...${BLANK}\n"
sudo apt-get dist-upgrade -y -q

printf "\n${BLUE}Installing Dependencies ...${BLANK}\n"
sudo apt-get install -y build-essential
sudo apt-get install -y cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev
sudo apt-get install -y python-dev python-numpy python-pip

printf "\n${BLUE}Cleaning Up Packages ...${BLANK}\n"
sudo apt-get autoremove -y
sudo apt-get clean -y

printf "\n${BLUE}Initializing Submodules ...${BLANK}\n"
git submodule init
printf "\n${BLUE}Updating Submodules ...${BLANK}\n"
git submodule update

printf "\n${BLUE}Installing Server Requirements ...${BLANK}\n"
sudo pip install -r requirements.txt

printf "\n${BLUE}Building OpenCV ...${BLANK}\n"
cd libraries/opencv_build
cmake -D CMAKE_BUILD_TYPE=Release -D CMAKE_INSTALL_PREFIX=/usr/local -DOPENCV_EXTRA_MODULES_PATH=../opencv_contrib/modules ../opencv
make -j$(nproc)
sudo make install
cd ../..

# printf "\n${BLUE}Installing Node ...${BLANK}\n"
# wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v6.9.1.sh | bash
# curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
# sudo apt-get install -y nodejs

printf "\n${BLUE}Installing Client Application ...${BLANK}\n"
cd application
npm install
printf "\n${BLUE}Building Client Application ...${BLANK}\n"
npm run build
cd ..

printf "\n${BLUE}All Done !${BLANK}\n"