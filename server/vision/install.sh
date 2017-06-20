#!/bin/bash

cd "$(dirname "$0")"

[[ "$(whoami)" != "root" ]] && echo "Please run script as root or sudo." && exit

apt-get install -y build-essential
apt-get install -y cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev
apt-get install -y python-dev python-numpy

git clone https://github.com/opencv/opencv.git
git clone https://github.com/opencv/opencv_contrib.git
cd opencv
mkdir build
cd build
cmake -D CMAKE_BUILD_TYPE=Release -D CMAKE_INSTALL_PREFIX=/usr/local -DOPENCV_EXTRA_MODULES_PATH=../../opencv_contrib/modules ..
make -j$(nproc)
make install