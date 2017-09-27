#!/bin/bash

cd "$(dirname "$0")"

BLUE="\033[0;34m"
BLANK="\033[0m"

printf "\n${BLUE}Updating Package Manager ...${BLANK}\n"
sudo apt-get update -y
printf "\n${BLUE}Upgrading Distribution ...${BLANK}\n"
sudo apt-get dist-upgrade -y -q
printf "\n${BLUE}Upgrading Packages ...${BLANK}\n"
sudo apt-get upgrade -y -q

printf "\n${BLUE}Installing Dependencies ...${BLANK}\n"
sudo apt-get install -y python-dev python-pip

printf "\n${BLUE}Cleaning Up Packages ...${BLANK}\n"
sudo apt-get autoremove -y
sudo apt-get clean -y

printf "\n${BLUE}Installing Server Requirements ...${BLANK}\n"
sudo -H pip install -U -r requirements.txt

printf "\n${BLUE}Updating Node Package Manager ...${BLANK}\n"
npm update -g

printf "\n${BLUE}Installing Client Application ...${BLANK}\n"
cd application
npm install
printf "\n${BLUE}Building Client Application ...${BLANK}\n"
npm run build
cd ..

printf "\n${BLUE}All Done !${BLANK}\n"