#!/usr/bin/env python

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

while True:
    response = { "type": "info", "msg": { "hello": "world" } }
    print(json.dumps(response))
    sys.stdout.flush()
    sleep(1);
    continue
    text_input = input() 
    str_input = json.loads(text_input, strict=False)["code"] 
    __repl_result = None
    try:
        if "=" in str_input or "import" in str_input or "for" in str_input:
            exec(str_input)
        else:
            exec("__repl_result = {}".format(str(str_input)))

        result = { 'success' : True }
        if __repl_result != None:
            result["result"] = __repl_result
    except:
        # TODO: Be more verbose
        result = { 'success' : False }
     
    print(json.dumps(result))
