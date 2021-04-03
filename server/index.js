// ROBOT TOSTER - MIT 2021
//
// -----
//
// This is main source code of the server
//

import { readFile } from "fs"
import path from "path"
import { join, dirname } from "path"
import pws from "ws"
const { Server } = pws;

import express from 'express'
const app = express()

import Program from "./program.js"
import loadPrograms from "./programs.js"

const programsList = [];

const __filename = import.meta.url.slice(7);
const __dirname = dirname(__filename);

const PORT = 1337;

const staticApp = express.static("public", {
    extensions: [ "html", "js", "css" ]
});

// Serve static content
app.use("/public", staticApp);

app.get("/", (req, res, next) => {
    res.sendFile(join(__dirname, "public/index.html"))
});

let programs = null;
loadPrograms(app).then((p) => { programs = p; }); 

// Start websocket server
const wsServer = new Server({
    port: 8000
});

let socketsList = [];

wsServer.on("connection", (currentSocket) => {
    socketsList.push(currentSocket);

    currentSocket.on("message", (msg) => {
        msg = JSON.parse(msg);
        const pName = msg.program;
        const prog = programs.findByName(pName);
        if (prog !== null) {
            const myId = msg.id;

            // Send response back only if id is valid and 
            // remove listener afterwards
            prog.on("data", function sendResponse(d) {
                if (d.id === myId) {
                    prog.clearData();
                    currentSocket.send(JSON.stringify(d));
                    prog.removeListener("data", sendResponse);
                }
                setTimeout(() => {
                    prog.removeListener("data", sendResponse);
                }, 1000);
            });        
            prog.send(msg);
        }
    });

    const infoHandler = (info) => {
        currentSocket.send(JSON.stringify(info));
    };

    programs.on("info", infoHandler);

    currentSocket.on("close", () => {
        // Removes closed socket
        socketsList = socketsList.filter((s) => { return s !== currentSocket });
        programs.removeListener("info", infoHandler);
    });
});

// TODO: Move whole api to another file
let id = 0;
app.get("/api/id", (req, res , next) => {
    res.contentType = "text";
    res.end(id.toString());
    id++;
});

app.get("/api/programs", (req, res) => {
    res.json(programs.getAllNames());
});

app.listen(PORT, () => {
    console.log(`Thinking on port ${PORT}`);
})
