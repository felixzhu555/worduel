import React, { useState, useEffect, useRef } from "react";
import { Button } from "reactstrap";
import LetterGrid from "../components/LetterGrid";
import * as data from "../wordle-words.json";
import { useNavigate } from "react-router";

// TODO: add colored keyboard feature
function Wordle() {
    
    const nav = useNavigate();
    const divRef = useRef(null);
    const words = data.words;

    const navHome = () => {
        nav("/");
    }

    const isLetter = (c) => {
        return c.length === 1 && c.toLowerCase() !== c.toUpperCase();
    }

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max);
    }

    const refreshWordle = () => {
        setAnswer(words[getRandomInt(words.length)]);
        setPastGuesses([]);
        setCurrentGuess("");
        setMessage("Can you guess the word within six tries?");
        setGameOver(false);
    }

    const [answer, setAnswer] = useState(words[getRandomInt(words.length)]);
    const [pastGuesses, setPastGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [message, setMessage] = useState("Can you guess the word within six tries?");
    const [gameOver, setGameOver] = useState(false);
    
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

    var buttonsDiv = gameOver ? (
        <div>
            <Button onClick={navHome} color="primary">Main Menu</Button>
            <Button onClick={refreshWordle}>Play Again</Button>
        </div>
    ) : (
        <div>
            <Button onClick={navHome} color="primary">Main Menu</Button>
        </div>
    );

    useEffect(() => {
        divRef.current.focus();
    })

    return (
        <div ref={divRef} onKeyDown={handleKeyPress} tabIndex={0} style={{outline: "none"}}>
            <h1>Wordle! {answer}</h1>
            <h3>{message}</h3>
            {buttonsDiv}
            <LetterGrid pastGuesses={pastGuesses} currentGuess={currentGuess} answer={answer}/>
        </div>
    )
}

export default Wordle;