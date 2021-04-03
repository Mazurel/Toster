#!/bin/sh

echo Updating and installing necessary things
apt update
apt upgrade
apt install node python3 python3-pip

echo Installing node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs
