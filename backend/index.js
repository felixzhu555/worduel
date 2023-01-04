// run backend servers

import express from "express";
const app = express();
import cors from "cors";
app.use(cors());

import { createServer } from "http";
const server = createServer(app);
import { Server } from "socket.io";
const io = new Server(server);

const port = process.env.PORT || 4000;

io.on('connect', (socket) => {
    console.log('socket connected: ', socket.id);
    socket.on("disconnect", (reason) => {
        console.log(reason, socket.id);
    });
});

server.listen(port, () => {
    console.log('listening on port ' + port);
});