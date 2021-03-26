#!/usr/bin/env python

import json
from time import sleep
import sys

while True:
    request = input()
    jsonedRequest = json.loads(request, strict=False)
    jsonedRequest["type"] = "response"
    print(json.dumps(jsonedRequest))
    sys.stdout.flush()
