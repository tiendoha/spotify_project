import React, { Component, useContext } from 'react';
// import Sidebar from './components/sidebar';
// import Player from './components/Player';
// import Display from './components/Display';
// import { PlayerContext } from './context/PlayerContext';
import Messages from './components/Messages';
const App = () => {

  // const { audioRef, track } = useContext(PlayerContext)
  return (
    <div className="h-screen bg-black">
      <div className="h-[90%] flex">
        <Sidebar />
        <Display />
      </div>
      <PrivateRoute path="/messages" component={Messages} exact/>
      <Player />
      <audio ref={audioRef} preload='auto'></audio>
    </div>
  )
}

export default App