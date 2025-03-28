import React, { Component, useContext } from 'react';
import Sidebar from './components/sidebar';
import Player from './components/Player';
import Display from './components/Display';
import { PlayerContext } from './context/PlayerContext';
import Login from './components/LogIn';
import SignUp from './components/SignUp';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
const App = () => {

  const { audioRef, track } = useContext(PlayerContext)

  const MainLayout = () => (
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