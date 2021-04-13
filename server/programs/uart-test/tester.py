#!/usr/bin/env python

import json
from time import sleep
import sys

import toster
import serial

import termios
import fcntl


def reqHandler(req):
    toster.sendInfo(req["msg"])
    try:
        ser = serial.Serial(req["msg"]["path"], timeout=0)    #Open named port 
        fd = ser.fileno()
        oldAttr = termios.tcgetattr(fd)
        oldAttr[2] = oldAttr[2] & ~termios.HUPCL
        termios.tcsetattr(fd, termios.TCSANOW, oldAttr)
        ser.baudrate = 9600                     #Set baud rate to 9600
        ser.nonblocking()
        state = req["msg"]["message"]
        ser.write(bytes(state + "\n", "UTF-8"))
        ser.write(0x0)
        response = ser.readline()
        ser.close()
        toster.sendResponse(req, {"response": response})
    except:
        toster.sendResponse(req, {"err": True})

toster.registerRequestCallback(reqHandler)
toster.start(block=True)

