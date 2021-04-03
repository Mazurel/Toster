# Toster

This repo contains source code for project called "Robot Toster".
Some parts of the code or the docs may not be in English, although it is recommended to use English in here.
Feel free to contribute as much as you wish.

Link to docs explaining how this project works and how to hack on it is [here](docs/docs.md). 

## Starting up the server

This project is intended to be runned on raspberry pi with Gnu/Linux.
For development is is not a problem to run it on some other unix based machine, although running it under Windows may raise some problems (not tested yet).

## Installing on target machine

> This is really experimental and needs more tests

```sh
sh ./scripts/installDeps.sh
sh ./scripts/setupNetworking.sh
sh ./scripts/setupServer.sh
```

Everything should work after that one 

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
