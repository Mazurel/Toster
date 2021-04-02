// ROBOT TOSTER - MIT 2021
//
// -----
//
// This is an api for programs loading etc.

import { readFile } from "fs"
import { join } from "path"
import Program from "./program.js"
import EventEmmiter from "events"
import { dirname } from "path";

import express from 'express'

const __filename = import.meta.url.slice(7);
const __dirname = dirname(__filename);

class Programs extends EventEmmiter {
    constructor(programsList) {
        super();
        this.programsList = programsList; 

        for (const program of programsList) {
            // Setup info event
            program.on("data", (r) => {
                if (r !== undefined && r.type === "info") {
                    r.program = program.getName();
                    this.emit("info", r);
                }
            });
        }
    }   

    findByName(name) {
        const searchResult = this.programsList.filter((v) => { return v.getName() === name });
        if (searchResult.length > 1) {
            console.error("There are more than one programs with name: ", name);
            return null;
        }

        if (searchResult.length === 0) {
            return null;
        }

        return searchResult[0]; 
    }

    getAllNames() {
        return this.programsList.map((p) => p.getName());
    }
};

export default function startPrograms(app) {
    return new Promise((resolve, reject) => {
        readFile(join(__dirname, "programs/index.json"), (err, data) => {
            if (err) {
                console.error("No programs were provided to the server:");
                console.error(err);
                reject();
            }

            let programsList = [];

            const str = Buffer.from(data);
            try {
                const programsData = JSON.parse(str);
                for (const individualProgram of programsData) {
                    if (individualProgram.Enable === false) continue;

                    const p = new Program(individualProgram.Name, 
                                          individualProgram.Program, 
                                          [ join(__dirname, "programs", individualProgram.Path) ],
                                          {
                                            autoRestart: individualProgram.autoRestart
                                          }); 
                    
                    p.run();
                    // Run static routers with data associated with program
                    const staticProgramData = express.static(join(__dirname, "programs", individualProgram.Static), {
                        extensions: [ "html", "js", "css" ]
                    });

                    app.use("/" + individualProgram.Name.replace(" ", "%20") , staticProgramData);

                    programsList.push(p);
                }

                const programsContainer = new Programs(programsList);
                resolve(programsContainer); 
            }
            catch (err) {
                console.error("Invalid file format, no programs were loaded");
                console.error(err);
                reject();
            }
        });
    });
}
