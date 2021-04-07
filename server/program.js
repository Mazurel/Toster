// ROBOT TOSTER - MIT 2021
//
// -----
//
// This file provides api for programs management
// potentially splitted in the future

import { spawn } from 'child_process';
import EventEmmiter from 'events';

export default class Program extends EventEmmiter {
    constructor(formalName, cmd, args = [], settings = {}) {
        super();
        this.formalName = formalName;
        this.cmd = cmd;
        this.cargs = args;
        this.processReference = null;
        this._data = null;
        this.settings = settings;
    }

    run() {
        this.processReference = spawn(this.cmd, this.cargs, 
            {
                cwd : this.settings.pwd
            });

        this._data = null; // Create empty buffer

        let timeoutHandler = null;
        this.processReference.stdout.on("data", (chunk) => {
            clearTimeout(timeoutHandler);
            if (this._data === null) {
                this._data = chunk;
            }
            else {
                // Checks chunk data because theoretically this could be
                // string output instead of buffer 
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
                // If response can't be parsed set timeout
                // for 100ms after which resonse will fail.
                // If there will be some more data then timeout is cancelled.
                timeoutHandler = setTimeout(() => {
                    this._data = null;
                    this.emit("data", { success: false });
                }, 100);
            };
        });

        this.processReference.stderr.on("data", (chunk) => {
            console.log(chunk.toString('utf8'));
        });

        this.processReference.on("close", (code) => {
            // Restart app after it crashes without blocking event loop
            if (this.settings.autoRestart === true)
                setImmediate(() => {
                    this.run();
                });
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

    // TODO: Make killing smarter: firstly sigkill, then sigterm 
    //       like systemd does it. Also test how it works.

    close() {
        this.processReference.kill(); 
        this.settings.autoRestart = false;
    }

    restart() {
        this.processReference.on("close", () => {
            this.run();
        });

        this.processReference.kill();
    }
}
