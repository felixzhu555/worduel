import React from 'react';
import LetterSquare from './LetterSquare';
import "./letters.css";

function LetterRow({guess, answer, isCurrentRow}) {

    var letters = ["", "", "", "", ""];
    for (let i = 0; i < guess.length; i++) {
        letters[i] = guess.charAt(i);
    }

    if (isCurrentRow) {
        return (
            <div className="letter-row">
                {letters.map((letter, i) => 
                    <LetterSquare key={i} letter={letter} color="white"/>
                )}
            </div>
        )
    }

    var colors = getColors(guess, answer);
    var squares = [];
    for (let i = 0; i < 5; i++) {
        squares.push(<LetterSquare key={i} letter={letters[i]} color={colors[i]}/>);
    }

    return (
        <div className="letter-row">
            {squares}
        </div>
    )
}

function getColors(guess, answer) {
    var letters = ["", "", "", "", ""];
    for (let i = 0; i < guess.length; i++) {
        letters[i] = guess.charAt(i);
    }

    var answerLetterCounts = new Map();
    var guessLetterCounts = new Map();
    for (let letter of answer) {
        if (answerLetterCounts.has(letter)) {
            answerLetterCounts.set(letter, answerLetterCounts.get(letter) + 1);
        } else {
            answerLetterCounts.set(letter, 1);
        }
        if (!guessLetterCounts.has(letter)) {
            guessLetterCounts.set(letter, 0);
            for (let guessLetter of guess) {
                if (guessLetter === letter) {
                    guessLetterCounts.set(letter, guessLetterCounts.get(letter) + 1);
                }
            }
        }
    }
    
    var colors = [];
    for (let i = 0; i < 5; i++) {
        let color = null;
        if (answer.charAt(i) === letters[i]) {
            color = "green";
        } else if (answer.includes(letters[i])) {
            color = "yellow";
        } else {
            color = "gray";
        }
        colors.push(color);
    }

    for (let [letter, answerCount] of answerLetterCounts) {
        let diff = guessLetterCounts.get(letter) - answerCount;
        if (diff > 0) {
            for (let i = 4; i >= 0 && diff > 0; i--) {
                if (colors[i] === "yellow" && guess.charAt(i) === letter) {
                    colors[i] = "gray";
                    diff--;
                }
            }
        }
    }

    return colors;
}

export function getColorString(guess, answer) {
    let colors = getColors(guess, answer);
    let ret = "";
    for (let color of colors) {
        if (color === "green") {
            ret += "g";
        } else if (color === "yellow") {
            ret += "y";
        } else if (color === "gray") {
            ret += "x";
        }
    }
    return ret;
}

export default LetterRow;