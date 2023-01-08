import React from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router";

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
            <Button onClick={navWordle} color="primary">Classic Wordle</Button>
            <Button onClick={navWorduel} color="primary">Worduel</Button>
        </div>
    )
}

export default Home;