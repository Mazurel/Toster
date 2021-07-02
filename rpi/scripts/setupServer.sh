#!/bin/sh

echo Setting up files ...

# Folder that will store all the data
# TODO: Figure out better folder structure
mkdir -p /usr/share/toster/
cp -rf ./* /usr/share/toster/

cd /usr/share/toster/server

echo Setting up server ...
npm install || echo Failed installing node modules

cat > /etc/systemd/system/toster.service << EOF
[Unit]
Description=Toster server

[Service]
Type=simple
ExecStart=npm start
Restart=on-failure
WorkingDirectory=/usr/share/toster/server

[Install]
WantedBy=multi-user.target
EOF

systemctl enable toster
systemctl start toster
systemctl status toster
