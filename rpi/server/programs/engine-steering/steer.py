#!/usr/bin/env python

import fcntl
import json
import sys
import termios
from time import sleep

import toster
import serial

# Changes serial behaviour
# see: https://linux.die.net/man/3/termios
def modifyFD(fd):
    oldAttr = termios.tcgetattr(fd)
    oldAttr[2] = oldAttr[2] & ~termios.HUPCL
    termios.tcsetattr(fd, termios.TCSANOW, oldAttr)


def reqHandler(req):
    tbs = ""
    msg = req["msg"]
    serialPort = msg["port"]
    if "angle" in msg:
        angle = msg["angle"]
        if angle["right"]:
            tbs += "R"
        else:
            tbs += "L"
        tbs += str(angle["power"])
        toster.sendInfo({ "tbs": tbs })
    elif "velocity" in msg:
        vel = msg["velocity"]
        if vel["forward"]:
            tbs += "F"
        else:
            tbs += "B"
        tbs += str(vel["power"])
    tbs += " "
    ser = serial.Serial(serialPort, timeout=0)
    modifyFD(ser.fileno())
    ser.baudrate = 9600
    ser.nonblocking()
    ser.write(bytes(tbs, "UTF-8"))
    ser.close()
    toster.sendResponse(req, {"tbs": tbs})
    toster.sendInfo(req["msg"])

toster.registerRequestCallback(reqHandler)
toster.start(block=True)

