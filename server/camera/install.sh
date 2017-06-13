#!/bin/bash

cd "$(dirname "$0")"

[[ "$(whoami)" != "root" ]] && echo "Please run script as root or sudo." && exit

apt-get install -y libav-tools