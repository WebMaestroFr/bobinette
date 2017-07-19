#!/bin/bash

cd "$(dirname "$0")"

apt-get update -y
apt-get dist-upgrade -y -q
apt-get autoremove -y
apt-get clean -y

git submodule init
git submodule update

cd client
npm install
npm run build
cd ../server
npm install