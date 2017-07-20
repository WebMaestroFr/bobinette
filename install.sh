#!/bin/bash

cd "$(dirname "$0")"

sudo apt-get update -y
sudo apt-get dist-upgrade -y -q
sudo apt-get autoremove -y
sudo apt-get clean -y

git submodule init
git submodule update

cd client
npm install
npm run build
cd ../server
npm install