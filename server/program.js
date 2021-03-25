// ROBOT TOSTER - MIT 2021
//
// -----
//
// This file provides api for programs management
// potentially splitted in the future

import { spawn } from 'child_process';
import EventEmmiter from 'events';

export default class Program extends EventEmmiter {
    constructor(formalName, cmd, args = []) {
        super();
        this.formalName = formalName;
        this.cmd = cmd;
        this.cargs = args;
        this.processReference = null;
        this._data = null;
    }

    run() {
        this.processReference = spawn(this.cmd, this.cargs);

        this._data = null; // Create empty buffer

        let timeoutHandler = null;
        this.processReference.stdout.on("data", (chunk) => {
            clearTimeout(timeoutHandler);
            if (this._data === null) {
                this._data = chunk;
            }
            else {
                // If it is not a buffer convert it to buffer
                if (typeof chunk === "string") 
                    this._data = Buffer.concat([ this._data, Buffer.from(chunk)]);
                else 
                    this._data = Buffer.concat([ this._data, chunk ]);
            }

            const str = this._data.toString('utf8');
            try {
                const parsedResult = JSON.parse(str);
                this._data = null;
                this.emit("data", parsedResult);
                return;
            }
            catch {
                // If couldn't be parsed then wait more
                timeoutHandler = setTimeout(() => {
                    this._data = null;
                    // Error
                    //this.emit("data", { success: false });
                }, 100);
            };
        });

        this.processReference.stderr.on("data", (chunk) => {
            console.log(chunk.toString('utf8'));
        });

        this.processReference.on("close", (code) => {
            console.warn(`${this.formalName} exitted with error code ${code}`);
        });

        this.processReference.on("error", (err) => {
            console.error(`${this.formalName} throwed error: ${err}`);
        });
    }

    // Should be run to clean cache, for example
    // when program timeouts
    clearData() {
        this._data = null;
    }

    getName() {
        return this.formalName;
    }

    send(request) {
        let output = null;
        if (typeof request === "object") // I assume this one as object
            output = Buffer.from(JSON.stringify(request) + "\n");
        else // I assume this one as string
            throw "Requst must be an object";

        this.processReference.stdin.write(output);
    }
}
