import React, { Component, useContext } from 'react';
<<<<<<< HEAD
// import Sidebar from './components/sidebar';
// import Player from './components/Player';
// import Display from './components/Display';
// import { PlayerContext } from './context/PlayerContext';
import Messages from './components/Messages';
=======
import Sidebar from './components/sidebar';
import Player from './components/Player';
import Display from './components/Display';
import { PlayerContext } from './context/PlayerContext';
<<<<<<< HEAD
>>>>>>> 5cee4f425a640417dd5acdf7e1a551e54bb80bf6
const App = () => {

  // const { audioRef, track } = useContext(PlayerContext)
  return (
=======
import Login from './components/LogIn';
import SignUp from './components/SignUp';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
const App = () => {

  const { audioRef, track } = useContext(PlayerContext)

  const MainLayout = () => (
>>>>>>> 156575655a3f5532731849fad71247b3f01fe822
    <div className="h-screen bg-black">
      <div className="h-[90%] flex">
        <Sidebar />
        <Display />
      </div>
      <Player />
      <audio ref={audioRef} preload='auto'></audio>
    </div>
  );

  const LoginLayout = () => (
    <div className="app h-screen bg-black">
      <Login />
    </div>
  );

  const SignupLayout = () => (
    <div className="app h-screen bg-black">
      <SignUp />
    </div>
  );
  return (
    <Routes>
      <Route path="/login" element={<LoginLayout />} />
      <Route path="/signup" element={<SignupLayout />} />
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  )
}

export default App