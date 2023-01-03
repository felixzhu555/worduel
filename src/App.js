import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Wordle from "./pages/Wordle";
import Worduel from "./pages/Worduel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/"
          element={<Home />} 
        />
        <Route 
          path="/wordle" 
          element={<Wordle />} 
        />
        <Route 
          path="/worduel" 
          element={<Worduel />} 
        />
        <Route 
          path="*" 
          element={<h2>Path does not exist.</h2>} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
