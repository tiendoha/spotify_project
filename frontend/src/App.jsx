import React, { useContext } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Display from './components/Display';
import { PlayerContext } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import Login from './components/LogIn';
import SignUp from './components/SignUp';
import Messages from './components/Messages'; // Thêm Messages
import MessageDetail from './components/MessageDetail'; // Thêm MessageDetail
import SearchUsers from './components/SearchUsers'; // Thêm SearchUsers
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

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginLayout />} />
        <Route path="/signup" element={<SignupLayout />} />
        <Route path="/messages" element={<Messages />} />
      <Route path="/messages/:otherUserId" element={<MessageDetail />} />
        <Route path="/search-users" element={<SearchUsers />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;