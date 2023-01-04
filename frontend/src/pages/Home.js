import React from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

function Home() {

    const nav = useNavigate();

    const navWordle = () => {
        nav("/wordle");
    }
    const navWorduel = () => {
        nav("/worduel");
    }

    return (
        <div>
            <h1>Welcome to Worduel!</h1>
            <Button onClick={navWordle}>Classic Wordle</Button>
            <Button onClick={navWorduel}>Worduel</Button>
        </div>
    )
}

export default Home;