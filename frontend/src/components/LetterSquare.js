import React from "react";
import "./letters.css"

function LetterSquare({letter, color}) {

    var textColor = "white-text";
    if (color === "white") {
        textColor = "black-text";
    }

    return (
        <div className="letter-square" id={color}>
            <div className="letter" id={textColor}>
                {letter}
            </div>
        </div>
    )
}

export default LetterSquare;