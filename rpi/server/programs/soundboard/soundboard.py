#!/usr/bin/env python

import sys
import json
import os
from os import path

import toster

# TODO: Change it to /var/db/toster-soundboard on rpi
TRACKS_PATH = "/var/db/toster-soundboard"

try:
    os.makedirs(TRACKS_PATH)
except FileExistsError:
    # Create folder only if it does not exist
    pass


def onRequest(req):
    msg = req["msg"]
    #print(msg, file=sys.stderr)
    
    if "play" in msg:
        soundTrack = msg["play"]
        soundTrackPath = path.join(TRACKS_PATH, soundTrack)

        # Play sound via omxplayer
        os.system(f"omxplayer --no-keys \"{soundTrackPath}\"")

        toster.sendResponse(req, { "ok": True })
    elif "list" in msg and msg["list"]:
        tracks = os.listdir(TRACKS_PATH)

        # Filter invalid filetypes
        toster.sendResponse(req, { "tracks": tracks })
    pass

toster.registerRequestCallback(onRequest)
toster.start(block=True)
