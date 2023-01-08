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
        sessionStorage.setItem("username", username);
        socket.emit("try-join-lobby", code, username);
    }

    useEffect(() => {

        socket.on("created-lobby", (randomCode, players) => {
            sessionStorage.setItem("players", JSON.stringify(players));
            nav("/worduel/" + randomCode);
        });

        socket.on("lobby-already-exists", createNewLobby);

        socket.on("joined-lobby", (players) => {
            sessionStorage.setItem("players", JSON.stringify(players));
            nav("/worduel/" + code);
        });

        socket.on("lobby-doesnt-exist", () => {
            setLobbyDNE(true);
        });

        socket.on("username-taken", () => {
            setUsernameTaken(true);
        })

        return () => {
            socket.removeAllListeners()
        }
    }, [socket, code])


    return (
        <div>
            <h1>
                Worduel!
            </h1>
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
                Username taken for lobby {code}.
                Please enter another name.
            </Alert>
        </div>
    )
}

export default WorduelSetup;