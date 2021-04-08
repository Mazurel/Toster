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

def reqHandler(req):
    try:
        with open(".interp.py", "w") as f:
            f.write(req["msg"]["code"])
        
        with Popen(["python3", ".interp.py"], stderr=PIPE, stdin=PIPE, stdout=PIPE) as p:
            try:
                p.wait(0.5) # Wait for 0.5 second
                result = p.stdout.read().decode("utf-8")
                errors = p.stderr.read().decode("utf-8")
                toster.sendResponse(req, { "err": errors, "response": result })
            except TimeoutExpired:
                p.kill()
                toster.sendResponse(req, { "err": "Program timed out ...", "response": "" })
    except:
        toster.sendResponse(req, { "t": False, "response": req["msg"]["code"] })

toster.registerRequestCallback(reqHandler)
toster.start(block=True)

#while True:
#    toster.sendInfo({ "hello": "world" })
#    sleep(10)
#    continue

