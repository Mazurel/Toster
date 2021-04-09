#!/usr/bin/env python

# What is it supposed to be:
# This script acts as a simple json based repl.
# Input code needs to be inside "code" field.
# Output code sets success and result field.
# Json data needs to be newline terminated.

# TODO: This needs complete rework, as currently it breaks
#       when fnction print is being runned. This program should
#       spawn antoher process and communiacte with it.
#       This would potentially allow this to use another repl.

import json
from time import sleep
import sys
import os
from subprocess import TimeoutExpired, Popen, PIPE

import toster

pRef = None

def reqHandler(req):
    global pRef

    try:
        if (pRef != None):
            pRef.kill()
            pRef = None
            toster.sendInfo({ "text": "I have restarted" })
        with open(".interp.py", "w") as f:
            f.write(req["msg"]["code"])

        pRef = Popen(["python3", ".interp.py"], stderr=PIPE, stdin=PIPE, stdout=PIPE)
        toster.sendResponse(req, { "response": "Program have started !" })
        finished = False
        while not finished: 
            try:
                pRef.wait(0.1) # Wait for 0.1 second
                finished = True
            except TimeoutExpired:
                pass
            result = pRef.stdout.read().decode("utf-8")
            errors = pRef.stderr.read().decode("utf-8")
            toster.sendInfo({ "err": errors, "response": result })
    except:
        toster.sendResponse(req, { "t": False, "response": req["msg"]["code"] })

toster.registerRequestCallback(reqHandler)
toster.start(block=True)

#while True:
#    toster.sendInfo({ "hello": "world" })
#    sleep(10)
#    continue

