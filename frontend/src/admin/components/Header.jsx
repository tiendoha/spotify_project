import React from "react";
import { FaUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function Header() {
  return (
    <header className="h-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 flex items-center justify-between shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="flex items-center gap-4 transform transition-transform duration-200">
        <img
          src={logo}
          alt="Spotify Admin"
          className="w-12 h-12 object-contain filter drop-shadow-md"
        />
        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">
          Spotify Admin
        </h1>
      </div>
    </header>
  );
}
