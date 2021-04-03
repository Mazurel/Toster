#!/bin/sh

sudo -Es

echo Updating and installing necessary things
apt update
apt upgrade
apt install node python3 python3-pip

echo Installing nvm and nodejs
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

nvm install node
