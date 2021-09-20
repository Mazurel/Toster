#!/bin/sh

echo Updating programs ...

cp -rf server/programs/* /usr/share/toster/server/programs/

systemctl restart toster
systemctl status toster
