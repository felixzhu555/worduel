import React from "react";
import { useParams } from "react-router-dom";
import Worduel from "./Worduel";

function GetWorduelCode() {
    let { code } = useParams();
    return (
        <Worduel code={code} />
    )
}

export default GetWorduelCode;