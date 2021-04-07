# This file contains simple python module
# for communication with the server

from threading import Thread, RLock
import sys
import json

__infoCallbacks = []
__requestCallbacks = []

__communicationThread = None

__localLock = RLock()

def registerInfoCallback(cb):
    __localLock.acquire()
    __infoCallbacks.append(cb) 
    __localLock.release()

def registerRequestCallback(cb):
    __localLock.acquire()
    __requestCallbacks.append(cb) 
    __localLock.release()

def __innerLoop():
    while True:
        isLocked = False
        try:
            data = input()
            parsed = json.loads(data, strict=False)
            __localLock.acquire()
            isLocked = True
            if parsed["type"] == "info":
                for cb in __infoCallbacks:
                    cb(parsed)
            elif parsed["type"] == "request":
                for cb in __requestCallbacks:
                    cb(parsed)
        except json.JSONDecodeError:
           continue 
        finally:
            if isLocked:
                __localLock.release()
            isLocked = False

def start(block=False):
    __communicationThread = Thread(target=__innerLoop, daemon=True)
    __communicationThread.start()
    if block:
        __communicationThread.join()

def sendResponse(req: dict, msg: dict):
    reqCopy = req.copy()
    reqCopy["type"] = "response"
    reqCopy["msg"] = msg
    print(json.dumps(reqCopy))
    sys.stdout.flush()

def sendInfo(msg: dict):
    infoData = {
            "type": "info",
            "msg": msg
            }
    print(json.dumps(infoData))
    sys.stdout.flush()
