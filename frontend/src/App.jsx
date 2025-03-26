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
>>>>>>> 5cee4f425a640417dd5acdf7e1a551e54bb80bf6
const App = () => {

  // const { audioRef, track } = useContext(PlayerContext)
  return (
    <div className="h-screen bg-black">
      <div className="h-[90%] flex">
        <Sidebar />
        <Display />
      </div>
      <Player />
      <audio ref={audioRef} preload='auto'></audio>
    </div>
  )
}

export default App