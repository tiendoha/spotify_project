import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import DisplayHome from "./DisplayHome";
import DisplayAlbum from "./DisplayAlbum";
import Messages from "./Messages";
import axios from "axios";
import ColorThief from "colorthief";
import DisplayArtist from "./DisplayArtist"
import DisplayPlaylist from "./DisplayPlaylist";
import EditProfile from "./EditProfile";

const Display = () => {
  const [album, setAlbum] = useState(null);
  const displayRef = useRef();
  const location = useLocation();
  const isAlbum = location.pathname.includes("album");
  const albumId = isAlbum ? location.pathname.split("/").pop() : "";

  useEffect(() => {
    const fetchData = async () => {
      if (!albumId) return;
      try {
        const albumRes = await axios.get(
          `/api/albums/${albumId}/`
        );
        setAlbum(albumRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [albumId]);

  useEffect(() => {
    if (isAlbum && album && album.image) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = `/media${album.image}`;
      img.onload = () => {
        const colorThief = new ColorThief();
        const [r, g, b] = colorThief.getColor(img);
        displayRef.current.style.background = `linear-gradient(rgb(${r}, ${g}, ${b}), #121212)`;
      };
    } else {
      displayRef.current.style.background = "#121212";
    }
  }, [isAlbum, album]);

  return (
    <div
      ref={displayRef}
      className="w-[100%] m-2 px-5 pt-4 rounded bg-[#121212] text-white overflow-auto lg:w-[75%] lg:ml-0"
    >
      <Routes>
        <Route path="/" element={<DisplayHome />} />
        <Route path="/home" element={<DisplayHome />} />
        <Route path="/album/:id" element={<DisplayAlbum />} />
        <Route path="/playlist/:id" element={<DisplayPlaylist />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/artist/:id" element={<DisplayArtist />} />
      </Routes>
    </div>
  );
};

export default Display;