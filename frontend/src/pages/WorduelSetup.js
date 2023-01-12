import React, { useEffect, useState } from "react";
import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import { useNavigate } from 'react-router-dom';
import socket from "../socket";

function WorduelSetup() {

    const nav = useNavigate();
    
    const [username, setUsername] = useState("");
    const [code, setCode] = useState("");
    const [usernameEmpty, setUsernameEmpty] = useState(false);
    const [lobbyDNE, setLobbyDNE] = useState(false);
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [lobbyInGame, setLobbyInGame] = useState(false);
    const [usernameWiped, setUsernameWiped] = useState(false);
    
    if (!usernameWiped) {
        let name = sessionStorage.getItem("username");
        if (name !== null && name !== undefined && typeof name !== "undefined") {
            socket.emit("try-leave-lobby-brute", name);
        }
        sessionStorage.setItem("username", "");
        setUsernameWiped(true);
    }

    const createNewLobby = () => {
        if (username === "") {
            setUsernameEmpty(true);
            return;
        }
        setUsernameEmpty(false);
        sessionStorage.setItem("username", username);
        let randomCode = Math.floor(Math.random() * (10000 - 1000) + 1000).toString();
        socket.emit("try-create-lobby", randomCode, username);
    }

    const joinLobby = () => {
        if (username === "") {
            setUsernameEmpty(true);
            setLobbyDNE(false);
            setUsernameTaken(false);
            return;
        }
        setUsernameEmpty(false);
        setLobbyDNE(false);
        setUsernameTaken(false);
        setLobbyInGame(false);
        sessionStorage.setItem("username", username);
        socket.emit("try-join-lobby", code, username);
    }

    useEffect(() => {

        socket.on("created-lobby", (randomCode, players) => {
            nav("/worduel/" + randomCode, {state: players});
        });

        socket.on("lobby-already-exists", createNewLobby);

        socket.on("joined-lobby", (players) => {
            nav("/worduel/" + code, {state: players});
        });

        socket.on("lobby-doesnt-exist", () => {
            setLobbyDNE(true);
        });

        socket.on("username-taken", () => {
            setUsernameTaken(true);
        });

        socket.on("cant-join-lobby-in-game", () => {
            setLobbyInGame(true);
        });

        return () => {
            socket.removeAllListeners();
        }
    });


    return (
        <div>
            <h1>
                Worduel!
            </h1>
            <Button onClick={() => nav("/")}>
                Main Menu
            </Button>
            <Form>
                <FormGroup>
                    <Label>
                        Enter username:
                    </Label>
                    <Input 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        name="username"
                        type="text"
                    />
                </FormGroup>
                <Button onClick={createNewLobby}>
                    Create New Lobby
                </Button>
                <h3>
                    OR
                </h3>
                <FormGroup>
                    <Label>
                        Enter 4-digit code:
                    </Label>
                    <Input 
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        name="code"
                        type="text"
                    />
                </FormGroup>
            </Form>
            <Button onClick={joinLobby}>
                Join Lobby
            </Button>
            <Alert color="danger" isOpen={usernameEmpty}>
                Please enter a username.
            </Alert>
            <Alert color="danger" isOpen={lobbyDNE}>
                Lobby not found, please try again.
            </Alert>
            <Alert color="danger" isOpen={usernameTaken}>
                Username taken for that lobby.
                Please enter another name.
            </Alert>
            <Alert color="danger" isOpen={lobbyInGame}>
                Cannot join, lobby is currently in a game.
            </Alert>
        </div>
    )
}

export default WorduelSetup;