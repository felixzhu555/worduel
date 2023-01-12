// run backend servers
import express from "express";
const app = express();
import cors from "cors";
app.use(cors());

import { createServer } from "http";
const server = createServer(app);
import { Server } from "socket.io";
const io = new Server(server);

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("./wordle-words.json");
const words = data.words;

const MAX_GUESSES = 6;

var lobbies = {};
// map lobby code -> Lobby objects

io.on('connect', (socket) => {
    console.log('socket connected: ', socket.id);
    
    socket.on("try-create-lobby", (code, username) => {
        if (lobbies.hasOwnProperty(code)) {
            socket.emit("lobby-already-exists");
        } 
        else {
            let newLobby = new Lobby(code);
            newLobby.addPlayer(new Player(username));
            lobbies[code] = newLobby;
            socket.data.username = username;
            socket.join(code);
            socket.emit("created-lobby", code, newLobby.players);
            console.log(username, "created lobby", code);
            listAllRooms();
        }
    });

    socket.on("try-join-lobby", (code, username) => {
        if (lobbies.hasOwnProperty(code)) {
            let lobby = lobbies[code];
            if (lobby.inGame) {
                socket.emit("cant-join-lobby-in-game");
                return;
            }
            for (let uname in lobby.players) {
                if (uname === username) {
                    socket.emit("username-taken");
                    return;
                }
            }
            lobby.addPlayer(new Player(username));
            socket.data.username = username;
            socket.join(code);
            socket.emit("joined-lobby", lobby.players);
            socket.to(code).emit("opponent-joined", lobby.players);
            console.log(username, "joined lobby", code);
            listAllRooms();
        }
        else {
            socket.emit("lobby-doesnt-exist");
        }
    });
    
    socket.on("try-leave-lobby", (code, username) => {
        lobbies[code].removePlayer(username);
        checkEmptyLobby(code);
        socket.data.username = "";
        socket.leave(code);
        socket.emit("left-lobby");
        if (lobbies.hasOwnProperty(code)) {
            socket.to(code).emit("opponent-left", lobbies[code].players);
        }
        console.log(username, "left lobby", code);
        listAllRooms();
    });

    socket.on("try-leave-lobby-brute", (username) => {
        for (let code of socket.rooms) {
            if (code !== socket.id) {
                lobbies[code].removePlayer(username);
                checkEmptyLobby(code);
                socket.data.username = "";
                socket.leave(code);
                if (lobbies.hasOwnProperty(code)) {
                    socket.to(code).emit("opponent-left", lobbies[code].players);
                }
                console.log(username, "left lobby", code);
                listAllRooms();
                break;
            }
        }
    });

    socket.on("disconnecting", () => {
        // socket should be in 1 room max
        // -> socket.rooms is Set {socket.id, roomID}
        let username = socket.data.username;
        for (let code of socket.rooms) {
            if (code !== socket.id) {
                lobbies[code].removePlayer(username);
                checkEmptyLobby(code);
                if (lobbies.hasOwnProperty(code)) {
                    socket.to(code).emit("opponent-left", lobbies[code].players);
                }
                console.log(username, "left lobby", code);
                listAllRooms();
                break;
            }
        }
    })
    
    socket.on("disconnect", (reason) => {
        console.log(socket.id, "disconnect:", reason);
    });

    socket.on("ready", (code, username) => {
        let lobby = lobbies[code];
        let players = lobby.players;
        players[username].status = "ready";
        if (lobby.everyoneReady()) {
            lobby.startGame();
            io.in(code).emit("everyone-ready", players, getRandomWord());
            console.log("lobby", code, username, "is ready");
            console.log("lobby", code, "everyone ready");
        } else {
            socket.emit("i-am-ready", players);
            socket.to(code).emit("opponent-ready", players);
            console.log("lobby", code, username, "is ready");
        }
    });

    socket.on("enter-guess", (code, username, newGrid) => {
        let lobby = lobbies[code];
        let thisPlayer = lobby.players[username];
        thisPlayer.grid = newGrid;
        if (newGrid[newGrid.length - 1] === "ggggg") {
            thisPlayer.status = "success";
            thisPlayer.rank = lobby.nextRank++;
            if (thisPlayer.rank === 1) {
                thisPlayer.wins++;
            }
            lobby.currentRanking.push(username);
            console.log("lobby", code, username, "SUCCESS");
        } else if (newGrid.length === MAX_GUESSES) {
            thisPlayer.status = "fail";
            thisPlayer.rank = -1;
            console.log("lobby", code, username, "FAIL");
        }
        let players = lobby.players;
        let ranking = lobby.currentRanking;
        if (lobby.gameFinished()) {
            lobby.endGame();
            io.in(code).emit("game-finished", players, ranking);
            console.log("lobby", code, "game finished");
        } else {
            socket.emit("guess-received", players, ranking);
            socket.to(code).emit("opponent-entered-guess", players, ranking);
        }
    });
});

const getRandomWord = () => {
    let randInt = Math.floor(Math.random() * words.length);
    return words[randInt];
}

const listAllRooms = () => {
    // console.log(io.sockets.adapter.rooms);
    // for (let code in lobbies) {
    //     console.log("Lobby", code, lobbies[code].players);
    // }
}

const checkEmptyLobby = (code) => {
    if (lobbies[code].numPlayers == 0) {
        delete lobbies[code];
    }
}

const port = process.env.PORT || 4000;
server.listen(port, () => {
    console.log('listening on port ' + port);
});


class Lobby {
    constructor(code) {
        this.code = code;
        this.players = {};  // dict: username -> Player
        this.numPlayers = 0;
        this.nextRank = 1;
        this.currentRanking = [];
        this.inGame = false;
    }

    addPlayer(player) {
        this.players[player.username] = player;
        this.numPlayers++;
    }

    removePlayer(username) {
        delete this.players[username];
        this.numPlayers--;
    }

    playersArray() {
        return Object.values(this.players);
    }

    everyoneReady() {
        return this.playersArray().every(
            player => player.status === "ready");
    }
        
    startGame() {
        this.inGame = true;
        this.nextRank = 1;
        this.currentRanking = [];
        for (let uname in this.players) {
            let player = this.players[uname];
            player.grid = [];
            player.status = "inProgress";
            player.rank = 0;
        }
    }
    
    gameFinished() {
        return this.playersArray().every(player => 
            player.status === "success" || player.status === "fail");
    }

    endGame() {
        this.inGame = false;
        for (let uname in this.players) {
            this.players[uname].status = "notReady";
        }
    }
}

class Player {
    constructor(username) {
        this.username = username;
        this.grid = [];  // y = yellow, g = green, x = gray
        this.status = "notReady";
        this.rank = null; // 0 = in progress, -1 = failed
        this.wins = 0; // num of first place finishes
    }
}