#!/bin/bash

cd "$(dirname "$0")"

sudo apt-get update -y
sudo apt-get dist-upgrade -y -q

sudo apt-get install -y build-essential
sudo apt-get install -y cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev
sudo apt-get install -y python-dev python-numpy python-pip

sudo apt-get autoremove -y
sudo apt-get clean -y

pip install "picamera[array]"

git submodule init
git submodule update

mkdir libraries/opencv_build
cd libraries/opencv_build
cmake -D CMAKE_BUILD_TYPE=Release -D CMAKE_INSTALL_PREFIX=/usr/local -DOPENCV_EXTRA_MODULES_PATH=../opencv_contrib/modules ../opencv
make -j$(nproc)
sudo make install

cd ../../client
npm install
npm run build
cd ../server
npm install