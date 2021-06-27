# Raspberry pi

## Starting up the server

This project is intended to be run on raspberry pi with Gnu/Linux.
For development is is not a problem to run it on some other unix based os, although running it under Windows may raise some problems (not tested yet).

## Installing on target machine

> Tested only for Rpi Os

```sh
# I assume that you have ssh enabled and ethernet cable connected

# You need to have git already, to do so run:
sudo apt install git

# Clone repo
git clone https://github.com/SKARPG/Toster.git
# You can also clone it on your PC and copy it
# to raspberry pi via sftp

cd Toster
sudo -Es
# Run installation scripts
sh ./scripts/installDeps.sh
sh ./scripts/setupNetworking.sh
sh ./scripts/setupServer.sh
```

## Debugging outside environment

### Requirements
- Stable or nightly build of `node.js` with `npm`.
- `python3` (for most programs)

### Setting things up

To clone the server and install npm packages:

```sh
# Clone the repo
git clone https://github.com/Mazurel/Toster.git
# Cd into directory
cd Toster
# Download node modules
cd server && npm run build
```

If you want to mess around with loaded programs you may also want to modify `programs/index.json` 
which contains currently active programs.

### Starting the server

```sh
cd server 
node index.js
# If there is no error everything is propably working all right
```

## Adding custom program

Programs are loaded by the server (currently on startup) based on a `programs/index.json` file. 
An JSON object that is in that file is an array of objects that define every program that is avaible to launch.
An object that represent program looks currently like that:

```json
{
    "Name": "Your program",
    "Program": "python or something else",
    "Path": "your-program/test.py",
    "Static" : "your-program/static",
    "Enable" : true
}
```

Field explanation:

Name - A formal name for you program, must Unique.

Program - A Program that executes you script like `python` or `sh`.

Path - A path to script that will be executed by the `Program` field.

Static - A path to folder with static html content that will be served for the program. The folder should contain index.html file.

Enable - This field is optional, it resolves to `true` by default.

*After adding custom program, remember to restart server !*

## Managing server

Server (when installed via installation scripts) is installed into `/usr/share/toster`, everything can be found there.
For example all programs are located in `/usr/share/toster/server/programs`.

Server is managed as a systemd service. Such solution really simplifies whole server execution, for example to check status of the server you can run:

```bash
systemctl status toster
```

Or to restart it, just run:

```bash
sudo systemctl restart toster
```

## Debugging programs

You **can't** use stdout for debugging. Stdout is reserved only for IPC communication.
If you want to debug programs that are runned by node.js server you need to use stderr.

For example for python you can use:
```python
print(msg, file=sys.stderr)
```

All stderr output from programs are printed to stdout by node.js server.

