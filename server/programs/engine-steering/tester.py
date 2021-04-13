#!/usr/bin/env python

import json
from time import sleep
import sys

import toster
import serial

import termios
import fcntl


def reqHandler(req):
    tbs = ""
    msg = req["msg"]
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
    ser = serial.Serial("/dev/ttyUSB0", timeout=0)    #Open named port 
    fd = ser.fileno()
    oldAttr = termios.tcgetattr(fd)
    oldAttr[2] = oldAttr[2] & ~termios.HUPCL
    termios.tcsetattr(fd, termios.TCSANOW, oldAttr)
    ser.baudrate = 9600                     #Set baud rate to 9600
    ser.nonblocking()
    ser.write(bytes(tbs, "UTF-8"))
    ser.close()
    toster.sendResponse(req, {"tbs": tbs})

toster.registerRequestCallback(reqHandler)
toster.start(block=True)

