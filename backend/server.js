// run backend servers
import express from "express";
const app = express();
import cors from "cors";
app.use(cors());

import { createServer } from "http";
const server = createServer(app);
import { Server } from "socket.io";
const io = new Server(server);

var lobbies = {};
// map lobby code -> list of players in that lobby

io.on('connect', (socket) => {
    console.log('socket connected: ', socket.id);
    
    socket.on("try-create-lobby", (code, username) => {
        if (Object.keys(lobbies).includes(code)) {
            socket.emit("lobby-already-exists");
        } 
        else {
            let players = [new Player(username)];
            lobbies[code] = players;
            socket.data.username = username;
            socket.join(code);
            socket.emit("created-lobby", code, players);
            console.log(username, "created lobby", code);
            listAllRooms();
        }
    });

    socket.on("try-join-lobby", (code, username) => {
        if (Object.keys(lobbies).includes(code)) {
            let players = lobbies[code];
            if (players.some(player => player.username === username)) {
                socket.emit("username-taken");
                return;
            }
            players.push(new Player(username));
            socket.data.username = username;
            socket.join(code);
            socket.emit("joined-lobby", players);
            socket.to(code).emit("opponent-joined", players);
            console.log(username, "joined lobby", code);
            listAllRooms();
        }
        else {
            socket.emit("lobby-doesnt-exist");
        }
    });
    
    socket.on("try-leave-lobby", (code, username) => {
        let players = lobbies[code];
        players = players.filter(p => p.username !== username);
        lobbies[code] = players;
        checkEmptyLobby(code);

        socket.data.username = "";
        socket.leave(code);
        socket.emit("left-lobby");
        socket.to(code).emit("opponent-left", players);
        console.log(username, "left lobby", code);
        listAllRooms();
    });

    socket.on("disconnecting", () => {
        // socket should be in 1 room max
        // -> socket.rooms is Set {socket.id, roomID}
        for (let code of socket.rooms) {
            if (code !== socket.id) {
                let players = lobbies[code];
                players = players.filter(
                    p => p.username !== socket.data.username
                );
                lobbies[code] = players;
                checkEmptyLobby(code);
                socket.to(code).emit("opponent-left", players);
                break;
            }
        }
    })
    
    socket.on("disconnect", (reason) => {
        console.log(socket.id, "disconnect:", reason);
        listAllRooms();
    });
});

const listAllRooms = () => {
    console.log(io.sockets.adapter.rooms);
    console.log("lobbies", lobbies);
}

const checkEmptyLobby = (code) => {
    if (lobbies[code].length == 0) {
        delete lobbies[code];
    }
}

const port = process.env.PORT || 4000;
server.listen(port, () => {
    console.log('listening on port ' + port);
});


class Player {
    constructor(username) {
        this.username = username;
        this.grid = [];
        // y = yellow, g = green, x = gray
    }
}