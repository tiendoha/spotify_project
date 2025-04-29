import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { TrackContext } from '../context/PlayerContext';
import Navbar from './Navbar';
import { assets } from '../assets/assets';

const DisplayArtist = () => {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const { playTrackById } = useContext(TrackContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy thông tin nghệ sĩ
                const artistRes = await axios.get(`http://127.0.0.1:8000/api/artists/${id}/`);
                setArtist(artistRes.data);

                // Lấy danh sách bài hát của nghệ sĩ
                const tracksRes = await axios.get('http://127.0.0.1:8000/api/tracks/');
                const artistTracks = tracksRes.data.filter(track => track.artist === parseInt(id));
                setTracks(artistTracks);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id]);

    if (!artist) {
        return (
            <div className="mt-10 text-white">Loading...</div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
                <img className="w-48 rounded" src={`http://127.0.0.1:8000/media${artist.image}`} alt={artist.name} />
                <div className="flex flex-col">
                    <h2 className="text-5xl font-bold mb-4 md:text-7xl">{artist.name}</h2>
                    <p>Artist</p>
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
                <p><b className="mr-4">#</b>Title</p>
                <p>Artist</p>
                <p className="hidden sm:block">Genre</p> {/* Thay thế "Date Added" bằng "Genre" */}
                <img className="m-auto w-4" src={assets.clock_icon} alt="" />
            </div>

            <hr />

            {tracks.map((item, index) => (
                <div
                    onClick={() => playTrackById(item.id)}
                    key={item.id}
                    className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
                >
                    <p className="text-white">
                        <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
                        <img className="inline w-10 mr-5" src={`http://127.0.0.1:8000/media${item.image}`} alt="" />
                        {item.name}
                    </p>
                    <p className="text-[15px]">{artist.name}</p>
                    <p className="text-[15px] hidden sm:block">{item.genre}</p> {/* Hiển thị genre */}
                    <p className="text-[15px] text-center">{item.duration}</p>
                </div>
            ))}
        </>
    );
};

export default DisplayArtist;
