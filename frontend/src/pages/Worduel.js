import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "reactstrap";
import LetterGrid from "../components/LetterGrid";
import OpponentGrid from "../components/OpponentGrid";
import * as data from "../wordle-words.json";
import socket from "../socket";
import "./worduel.css";

// TODO: MAX 5 PLAYERS

function Worduel({ code }) {

    const nav = useNavigate();
    const words = data.words;
    const username = sessionStorage.getItem("username");
    const playersJSON = JSON.parse(sessionStorage.getItem("players"));
    
    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max);
    }

    const [answer, setAnswer] = useState(words[getRandomInt(words.length)]);
    const [pastGuesses, setPastGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [message, setMessage] = useState("It's on! Can you guess the word before everyone else?");
    const [gameOver, setGameOver] = useState(false);
    const [numPlayers, setNumPlayers] = useState(playersJSON.length);

    const isLetter = (c) => {
        return c.length === 1 && c.toLowerCase() !== c.toUpperCase();
    }

    const leaveLobby = () => {
        socket.emit("try-leave-lobby", code, username);
    }

    useEffect(() => {

        socket.on("left-lobby", () => {
            nav("/");
        });
        
        socket.on("opponent-joined", (players) => {
            sessionStorage.setItem("players", JSON.stringify(players));
            setNumPlayers(numPlayers + 1);
        });

        socket.on("opponent-left", (players) => {
            sessionStorage.setItem("players", JSON.stringify(players));
            setNumPlayers(numPlayers - 1);
        });

        return () => {
            socket.removeAllListeners();
        }
    }, [socket, numPlayers]);

    const refreshWorduel = () => {
        setAnswer(words[getRandomInt(words.length)]);
        setPastGuesses([]);
        setCurrentGuess("");
        setMessage("It's on! Can you guess the word before everyone else?");
        setGameOver(false);
    }
    
    // TODO: fix issue where keypresses aren't registered unless the div is clicked
    // e.g. if the page is refreshed and you immediately type, nothing happens
    const handleKeyPress = (e) => {
        if (currentGuess === "game over") {
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
            setPastGuesses((pastGuesses) => [...pastGuesses, currentGuess]);
            if (currentGuess === answer) {
                setMessage("You got it! Nice job 😎");
                setCurrentGuess("game over");
                setGameOver(true);
            } else if (pastGuesses.length === 5) {
                setMessage("Tough luck, the word was " + answer.toUpperCase() + ".");
                setCurrentGuess("game over");
                setGameOver(true);
            } else {
                setCurrentGuess("");
            }
        }
    }

    let buttonsDiv = gameOver ? (
        <div>
            <Button onClick={refreshWorduel}>Play Again</Button>
            <Button onClick={leaveLobby}>Main Menu</Button>
        </div>
    ) : null ;

    let oppGrids = [];
    let players = []; // debuggin
    for (let i = 0; i < playersJSON.length; i++) {
        let u = playersJSON[i].username;
        let g = playersJSON[i].grid;
        if (u === username) {
            continue;
        }
        oppGrids.push(<OpponentGrid key={i} username={u} grid={g} />);
        players.push(u); // debugging
    }
    console.log(numPlayers, players); // debugging

    return (
        <div className="worduel-container" onKeyDown={handleKeyPress} tabIndex={0} style={{outline: "none"}}>
            <div className="one-third-width">
                <p>Lobby code: {code}</p>
                <p>Username: {username}</p>
                <h3>Current Winners</h3>
                <ol>
                    <li>1. alice</li>
                    <li>2. bob</li>
                </ol>
                <h3>Total Wins</h3>
                <ol>
                    <li>Bob 4</li>
                    <li>Alice 2</li>
                </ol>
            </div>
            <div className="one-third-width">
                <h1>Worduel! {answer}</h1>
                {buttonsDiv}
                <LetterGrid pastGuesses={pastGuesses} currentGuess={currentGuess} answer={answer}/>
                <h3>{message}</h3>
            </div>
            <div className="one-third-width">
                <h3>Opponent Progress</h3>
                <div className="grid-container">
                    {oppGrids.length > 0 ? oppGrids : <h5>Waiting for others to join...</h5>}
                </div>
            </div>
        </div>
    )
}

export default Worduel;