#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd ${DIR}

BLUE="\033[0;94m"
BLANK="\033[0m"

REVCODE=$(sudo cat /proc/cpuinfo | grep 'Revision' | awk '{print $3}' | sed 's/^ *//g' | sed 's/ *$//g')

printf "\n${BLUE}Updating Package Manager ...${BLANK}\n"
sudo apt-get update -y
printf "\n${BLUE}Upgrading Distribution ...${BLANK}\n"
sudo apt-get dist-upgrade -yq
printf "\n${BLUE}Upgrading Packages ...${BLANK}\n"
sudo apt-get upgrade -yq

printf "\n${BLUE}Installing Node${BLANK}\n"
if [ "$REVCODE" = "0x9000C1" ]; then
    # Raspberry Pi Zero W
    wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v6.9.1.sh | bash
else
    # Raspberry Pi 3 Model B or other
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
fi

printf "\n${BLUE}Installing Dependencies ...${BLANK}\n"
sudo apt-get install -yq python3-dev python3-pip
sudo apt-get install -yq build-essential
sudo apt-get install -yq cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev
sudo apt-get install -yq libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libjasper-dev libdc1394-22-dev
sudo apt-get install -yq libatlas-base-dev gfortran
sudo apt-get install -yq hostapd dnsmasq
sudo apt-get install -yq nodejs

printf "\n${BLUE}Cleaning Up Packages ...${BLANK}\n"
sudo apt-get autoremove -y
sudo apt-get clean -y

printf "\n${BLUE}Installing Server Requirements ...${BLANK}\n"
sudo -H pip3 install --upgrade pip picamera[array] RPi.GPIO
sudo -H pip3 install --upgrade -r requirements.txt

printf "\n${BLUE}Initializing Submodules ...${BLANK}\n"
git submodule init
printf "\n${BLUE}Updating Submodules ...${BLANK}\n"
git submodule update
printf "\n${BLUE}Check Out Version 3.3.1 ...${BLANK}\n"
cd ${DIR}/libraries/opencv
git checkout tags/3.3.1
cd ${DIR}/libraries/opencv_contrib
git checkout tags/3.3.1
cd ${DIR}

printf "\n${BLUE}Configuring OpenCV ...${BLANK}\n"
cd ${DIR}/libraries/opencv_build
cmake \
-D BUILD_opencv_java=OFF \
-D BUILD_opencv_python2=OFF \
-D BUILD_opencv_python3=ON \
-D BUILD_EXAMPLES=OFF \
-D BUILD_PERF_TESTS=OFF \
-D BUILD_TESTS=OFF \
-D CMAKE_BUILD_TYPE=RELEASE \
-D CMAKE_INSTALL_PREFIX=/usr/local \
-D ENABLE_NEON=ON \
-D ENABLE_VFPV3=ON \
-D OPENCV_EXTRA_MODULES_PATH=${DIR}/libraries/opencv_contrib/modules \
-D PYTHON3_EXECUTABLE=/usr/bin/python3 \
-D PYTHON_INCLUDE_DIR=/usr/include/python3.5 \
-D PYTHON_LIBRARY=/usr/lib/arm-linux-gnueabihf/libpython3.5m.so \
-D PYTHON3_NUMPY_INCLUDE_DIRS=/usr/local/lib/python3.5/dist-packages/numpy/core/include \
-D WITH_TBB=ON \
${DIR}/libraries/opencv

if [ "$REVCODE" = "a02082" ] || [ "$REVCODE" = "a22082" ]; then
    # Raspberry Pi 3 Model B
    printf "\n${BLUE}Increasing Swap Space ...${BLANK}\n"
    sudo mv -n -v /etc/dphys-swapfile /etc/dphys-swapfile.bak
    sudo cp /etc/dphys-swapfile.bak /etc/dphys-swapfile
    sudo sed -i -- 's/CONF_SWAPSIZE=100/CONF_SWAPSIZE=1024/g' /etc/dphys-swapfile
    sudo /etc/init.d/dphys-swapfile stop
    sudo /etc/init.d/dphys-swapfile start
    printf "\n${BLUE}Building OpenCV ...${BLANK}\n"
    sudo make -j4
else
    # Raspberry Pi Zero W or other
    printf "\n${BLUE}Building OpenCV ...${BLANK}\n"
    sudo make
fi

printf "\n${BLUE}Installing OpenCV ...${BLANK}\n"
sudo make install
sudo ldconfig
cd ${DIR}

if [ "$REVCODE" = "a02082" ] || [ "$REVCODE" = "a22082" ]; then
    # Raspberry Pi 3 Model B
    printf "\n${BLUE}Decreasing Swap Space ...${BLANK}\n"
    sudo sed -i -- 's/CONF_SWAPSIZE=1024/CONF_SWAPSIZE=100/g' /etc/dphys-swapfile
    sudo /etc/init.d/dphys-swapfile stop
    sudo /etc/init.d/dphys-swapfile start
fi

printf "\n${BLUE}Fixing CV2 Python Bindings${BLANK}\n"
sudo ln -sf /usr/local/lib/python3.5/dist-packages/cv2.cpython-35m-arm-linux-gnueabihf.so /usr/local/lib/python3.5/dist-packages/cv2.so

printf "\n${BLUE}Updating Node Package Manager ...${BLANK}\n"
sudo npm update -g

printf "\n${BLUE}Installing Client Application ...${BLANK}\n"
cd ${DIR}/application
npm install
printf "\n${BLUE}Building Client Application ...${BLANK}\n"
npm run build
cd ${DIR}

printf "\n${BLUE}Cron Task on Reboot ...${BLANK}\n"
crontab -l | grep -q 'python3 -m bobinette' || (crontab -l 2>/dev/null; echo "@reboot sudo python3 -m bobinette &") | crontab -

printf "\n${BLUE}All Done !${BLANK}\n"
sudo reboot