#!/bin/bash

cd "$(dirname "$0")"

[[ "$(whoami)" != "root" ]] && echo "Please run script as root or sudo." && exit

apt-get update -y
apt-get dist-upgrade -y -q
apt-get autoremove -y
apt-get clean -y

npm install -g npm
npm update -g
npm install -g fsevents

git submodule init
git submodule update

cd client
npm install --unsafe-perm
cd ../server
npm install --unsafe-perm
cd ..