import React from "react";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Display from "./components/Display";
import { PlayerContextProvider } from "./context/PlayerContext";
import Login from "./components/LogIn";
import SignUp from "./components/SignUp";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"; 
import AdminApp from "./admin/App";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const App = () => {
  const isAdmin = () => {
    const role = localStorage.getItem('role');
    return role === "admin"; 
  };

  const AdminRoute = ({ children }) => {
    const admin = isAdmin();
    if (!admin) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;  // Wrap children trong Fragment
  };

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
    <PlayerContextProvider>
      <Routes>
        <Route path="/login" element={<LoginLayout />} />
        <Route path="/signup" element={<SignupLayout />} />
        <Route 
          path="/admin/*" 
          element={
            <AdminRoute>
              <AdminApp />
            </AdminRoute>
          } 
        />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </PlayerContextProvider>
  );
};

export default React.memo(App);