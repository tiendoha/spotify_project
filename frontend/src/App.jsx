import React, { useContext } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Display from './components/Display';
import { PlayerContext } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext'
import Login from './components/Login';
import SignUp from './components/SignUp';
import Messages from './components/Messages';
import MessageDetail from './components/MessageDetail'; // Import MessageDetail
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";

const App = () => {
  const { audioRef } = useContext(PlayerContext);

  const MainLayout = () => (
    <div className="h-screen bg-black">
      <div className="h-[90%] flex">
        <Sidebar />
        <Display />
      </div>
      <Player />
      <audio ref={audioRef} preload="auto" />
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

  const MessagesLayout = () => (
    <div className="app h-screen bg-black">
      <Messages />
    </div>
  );

  const MessageDetailLayout = () => (
    <div className="app h-screen bg-black">
      <MessageDetail />
    </div>
  );

  return (
    <AuthProvider>
    <Routes>
          <Route path="/login" element={<LoginLayout />} />
          <Route path="/signup" element={<SignupLayout />} />
          <Route path="/inbox" element={<MessagesLayout />} />
          <Route path="/inbox/:id" element={<MessageDetailLayout />} />
          <Route path="/*" element={<MainLayout />} />
    </Routes>
    </AuthProvider>
  );
};

export default App;