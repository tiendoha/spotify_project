import React from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Display from './components/Display';
<<<<<<< HEAD
import { PlayerContext } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import Login from './components/LogIn';
import SignUp from './components/SignUp';
import Messages from './components/Messages'; // Thêm Messages
import MessageDetail from './components/MessageDetail'; // Thêm MessageDetail
import SearchUsers from './components/SearchUsers'; // Thêm SearchUsers
=======
import Login from './components/Login';
import SignUp from './components/SignUp';
import Messages from './components/Messages';
import MessageDetail from './components/MessageDetail';
import { AuthProvider } from './context/AuthContext';
import { PlayerContextProvider } from './context/PlayerContext';
>>>>>>> b43c57be62803e61da2f46d26c863d032f0e6c74
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  const MainLayout = () => (
    <div className="h-screen bg-black">
      <div className="h-[90%] flex">
        <Sidebar />
        <Display />
      </div>
      <Player />
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
<<<<<<< HEAD
      <Routes>
        <Route path="/login" element={<LoginLayout />} />
        <Route path="/signup" element={<SignupLayout />} />
        <Route path="/messages" element={<Messages />} />
      <Route path="/messages/:otherUserId" element={<MessageDetail />} />
        <Route path="/search-users" element={<SearchUsers />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
=======
      <PlayerContextProvider>
        <Routes>
          <Route path="/login" element={<LoginLayout />} />
          <Route path="/signup" element={<SignupLayout />} />
          <Route path="/inbox" element={<MessagesLayout />} />
          <Route path="/inbox/:id" element={<MessageDetailLayout />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </PlayerContextProvider>
>>>>>>> b43c57be62803e61da2f46d26c863d032f0e6c74
    </AuthProvider>
  );
};

export default React.memo(App);