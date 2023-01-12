import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import { Button } from "reactstrap";
import LetterGrid from "../components/LetterGrid";
import OpponentGrid from "../components/OpponentGrid";
import { getColorString } from "../components/LetterRow";
import socket from "../socket";
import "./worduel.css";
import * as data from "../wordle-words.json";

// TODO: MAX 5 PLAYERS
// TODO: add keyboard feature

function Worduel({ code }) {

    const nav = useNavigate();
    const { state } = useLocation();
    const divRef = useRef(null);
    const username = sessionStorage.getItem("username");
    const words = data.words;
    
    const [playersDict, setPlayersDict] = useState(state);
    console.log(playersDict);
    const my = (username !== "") ? playersDict[username] : {
        "username": "dummyAfterRefresh",
        "grid": [],
        "status": "notReady",
        "rank": null,
        "wins": 0
    }
    const playersArray = Object.values(playersDict);
    const numPlayers = playersArray.length;
    let readyCount = 0;
    for (let player of playersArray) {
        if (player.status === "ready") {
            readyCount++;
        }
    }

    const [answer, setAnswer] = useState(null);
    const [pastGuesses, setPastGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [ranking, setRanking] = useState([]);

    const isLetter = (c) => {
        return c.length === 1 && c.toLowerCase() !== c.toUpperCase();
    }

    const leaveLobby = () => {
        socket.emit("try-leave-lobby", code.toString(), username);
    }

    const pressReady = () => {
        socket.emit("ready", code.toString(), username);
    }
    
    const handleKeyPress = (e) => {
        if (my.status === "notReady" 
            || my.status === "ready" 
            || currentGuess === "game over") {
            return;
        }

        if (isLetter(e.key)) {
            if (currentGuess.length < 5) {
                setCurrentGuess(currentGuess + e.key);
            }
        } else if (e.key === "Backspace" && currentGuess.length > 0) {
            setCurrentGuess(currentGuess.substring(0, currentGuess.length - 1));
        } else if (e.key === "Enter" && currentGuess.length === 5) {
            if (!words.includes(currentGuess)) {
                // TODO: add alert: not valid word
                return;
            }

            let colorString = getColorString(currentGuess, answer);
            let myGrid = [...my.grid, colorString];
            socket.emit("enter-guess", code, username, myGrid);
            setPastGuesses((pastGuesses) => [...pastGuesses, currentGuess]);

            if (currentGuess === answer) {
                setCurrentGuess("game over");
            } else if (pastGuesses.length === 5) {
                setCurrentGuess("game over");
            } else {
                setCurrentGuess("");
            }
        }
    }

    useEffect(() => {

        if (sessionStorage.getItem("username") === "") {
            nav("/worduel");
        }

        divRef.current.focus();

        socket.on("left-lobby", () => {
            sessionStorage.setItem("username", "");
            nav("/");
        });
        
        socket.on("opponent-joined", setPlayersDict);

        socket.on("opponent-left", setPlayersDict);
        
        socket.on("i-am-ready", setPlayersDict)
        
        socket.on("opponent-ready", setPlayersDict);
        
        socket.on("everyone-ready", (players, word) => {
            setPlayersDict(players);
            setAnswer(word);
            setPastGuesses([]);
            setCurrentGuess("");
            setRanking([]);
        });

        socket.on("guess-received", (players, ranking) => {
            setPlayersDict(players);
            setRanking(ranking);
        });

        socket.on("opponent-entered-guess", (players, ranking) => {
            setPlayersDict(players);
            setRanking(ranking);
        });

        socket.on("game-finished", (players, ranking) => {
            setPlayersDict(players);
            setRanking(ranking);
        });
        
        window.onbeforeunload = () => {
            sessionStorage.setItem("username", "");
        };

        return () => {
            socket.removeAllListeners();
            window.onbeforeunload = null;
        }
    });

    // handle message box
    let finishMessage;
    if (my.rank === null) {
        finishMessage = <h5>Welcome! Ready up whenever.</h5>;
    } else if (my.rank < 0) {
        finishMessage = (
            <h5>Tough luck, the word was {answer.toUpperCase()}.</h5>
        );
    } else if (my.rank > 0) {
        finishMessage = (
            <h5>Nice job! Your rank this round: {my.rank}</h5>
        );
    }
    let messageBox;
    if (playersArray.length === 1) {
        messageBox = (
            <div>
                <Button onClick={pressReady} disabled>Ready</Button>
                <Button onClick={leaveLobby}>Main Menu</Button>
                <h5>Waiting for other players to join...</h5>
            </div>
        );
    } else if (my.status === "notReady") {
        messageBox = (
            <div>
                {finishMessage}
                <Button onClick={pressReady}>Ready</Button>
                <Button onClick={leaveLobby}>Main Menu</Button>
                <h5>{readyCount}/{numPlayers} ready</h5>
            </div>
        );
    } else if (my.status === "ready") {
        messageBox = (
            <div>
                {finishMessage}
                <Button onClick={pressReady} disabled>Ready</Button>
                <Button onClick={leaveLobby}>Main Menu</Button>
                <h5>Ready! {readyCount}/{numPlayers} ready</h5>
            </div>
        );
    } else if (my.status === "inProgress") {
        messageBox = (
            <div>
                <h5>It's on! Use your 6 tries quickly but wisely!</h5>
            </div>
        );
    } else if (my.status === "success") {
        messageBox = (
            <div>
                <h5>Nice job! Your rank this round: {my.rank}</h5>
                <h5>Waiting for everyone to finish...</h5>
            </div>
        );
    } else if (my.status === "fail") {
        messageBox = (
            <div>
                <h5>Tough luck, the word was {answer.toUpperCase()}.</h5>
                <h5>Waiting for everyone to finish...</h5>
            </div>
        );
    }

    let oppGrids = [];
    for (let i = 0; i < playersArray.length; i++) {
        let u = playersArray[i].username;
        let g = playersArray[i].grid;
        if (u === username) {
            continue;
        }
        oppGrids.push(<OpponentGrid key={i} username={u} grid={g} />);
    }

    let rankingItems = ranking.map((uname, i) => <li key={i}>{uname}</li>);
    if (rankingItems.length === 0) {
        rankingItems = <p>See how many players you can beat!</p>;
    }

    playersArray.sort((p1, p2) => p2.wins - p1.wins);
    let winsItems = playersArray.map((player, i) => 
        <li key={i}>{player.username}: {player.wins}</li>
    );

    return (
        <div className="worduel-container" ref={divRef}
        onKeyDown={handleKeyPress} tabIndex="0" style={{outline: "none"}}
        >
            <div className="one-third-width">
                <p>Lobby code: {code}</p>
                <p>Username: {username}</p>
                <h3>Current Winners</h3>
                <ol>{rankingItems}</ol>
                <h3>Total Wins</h3>
                <ol>
                    {winsItems}
                </ol>
            </div>
            <div className="one-third-width">
                <h1>Worduel! {answer}</h1>
                <LetterGrid 
                pastGuesses={pastGuesses} currentGuess={currentGuess} answer={answer}
                />
                {messageBox}
            </div>
            <div className="one-third-width">
                <h3>Opponent Progress</h3>
                <div className="grid-container">
                    {oppGrids.length > 0 ? 
                        oppGrids : <h5>It looks empty in here :(</h5>
                    }
                </div>
            </div>
        </div>
    )
}

export default Worduel;