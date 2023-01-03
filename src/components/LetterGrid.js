import React from "react";
import LetterRow from "./LetterRow";
import "./letters.css";

// display 6 rows at a time
// classic version stops after 6 guesses
// two-player has unlimited rows (guesses)

function LetterGrid({pastGuesses, currentGuess, answer}) {

    var rows = [];
    for (let i = 0; i < pastGuesses.length; i++) {
        rows.push(
            <LetterRow 
            key={i} 
            guess={pastGuesses[i]} 
            answer={answer} 
            isCurrentRow={false}/>
        );
    }
    if (currentGuess !== "game over") {
        rows.push(
            <LetterRow 
            key={pastGuesses.length} 
            guess={currentGuess} 
            answer={answer} 
            isCurrentRow={true}/>
        );
    }
    if (rows.length < 6) {
        for (let i = rows.length; i < 6; i++) {
            rows.push(
                <LetterRow 
                key={i} 
                guess="" 
                answer={answer} 
                isCurrentRow={true}/>
            );
        }
    }

    return (
        <div className="letter-grid">
            {rows}
        </div>
    )
}

export default LetterGrid;