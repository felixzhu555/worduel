import React from "react";
import "./letters.css";

function OpponentGrid({ username, grid }) {

    // if grid exceeds 6 rows, should have scrollbar
    // grid strings: y = yellow, g = green, x = gray

    let rows = [];
    for (let i = 0; i < grid.length; i++) {
        let row = [];
        for (let j = 0; j < 5; j++) {
            let color = "";
            switch (grid[i].charAt(j)) {
                case "y":
                    color = "yellow";
                    break;
                case "g":
                    color = "green";
                    break;
                case "x":
                    color = "gray";
                    break;
                default:
                    console.log("OpponentGrid color error");
            }
            row.push(
                <div key={j} className="letter-square" id={color}
                style={{width: "20px", height: "20px", margin: "1px"}}>
                </div>
            );
        }
        rows.push(<div key={i} className="letter-row">{row}</div>);
    }

    if (rows.length < 6) {
        for (let i = rows.length; i < 6; i++) {
            let row = [];
            for (let j = 0; j < 5; j++) {
                row.push(
                    <div key={j} className="letter-square" id="white"
                    style={{width: "20px", height: "20px", margin: "1px"}}>
                    </div>
                )
            }
            rows.push(<div key={i} className="letter-row">{row}</div>);
        }
    }

    return (
        <div>
            <h6>{username}</h6>
            <div className="letter-grid">
                {rows}
            </div>
        </div>
    )
}

export default OpponentGrid;