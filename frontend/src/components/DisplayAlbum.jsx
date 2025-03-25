import React, { useContext, useState, useEffect } from 'react'
import Navbar from './Navbar'
import { useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import { PlayerContext } from '../context/PlayerContext'
import axios from "axios";

const DisplayAlbum = () => {

    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [artist, setArtist] = useState(null);
    const { playWithID } = useContext(PlayerContext);
    useEffect(() => {
        const fetchData = async () => {
            try {

                const albumRes = await axios.get(`http://127.0.0.1:8000/api/albums/${id}/`);
                const artistRes = await axios.get(`http://127.0.0.1:8000/api/artists/${albumRes.data.artist}/`);
                setArtist(artistRes.data);
                const tracksRes = await axios.get('http://127.0.0.1:8000/api/tracks/');
                setAlbum(albumRes.data);

                const albumTracks = tracksRes.data.filter(track => track.album === parseInt(id));
                setTracks(albumTracks);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [id]);
    // Hàm tính tổng duration từ HH:MM:SS
    const calculateTotalDuration = () => {
        if (!tracks.length) return '0 min';

        const totalSeconds = tracks.reduce((sum, track) => {
            const [hours, minutes, seconds] = track.duration.split(':').map(Number);
            return sum + (hours * 3600) + (minutes * 60) + seconds;
        }, 0);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        } else {
            return `${minutes} min ${seconds} sec`;
        }
    };
    if (!album) {
        return (
            <>
                <Navbar />
                <div className="mt-10 text-white">Loading...</div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
                <img className='w-48 rounded' src={`http://127.0.0.1:8000/media${album.image}`} alt={album.name} />
                <div className="flex flex-col">
                    <p>Album</p>
                    <h2 className='text-5x1 font-bold mb-4 md:text-7xl'>{album.name}</h2>
                    <h4>{album.release_date}</h4>
                    <p className='mt-1'>
                        <img className='inline-block w-5' src={`http://127.0.0.1:8000/media${artist.image}`} alt={artist.name} />
                        <b> {artist.name} </b>
                        • <b>{tracks.length} songs, </b>
                        {calculateTotalDuration()}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
                <p><b className='mr-4'>#</b>Title</p>
                <p>Artist</p>
                <p className='hidden sm:block'>Date Added</p>
                <img className='m-auto w-4' src={assets.clock_icon} alt="" />
            </div>
            <hr /> {
                tracks.map((item, index) => (
                    <div onClick={() => playWithID(item.id)} key={item.id} className='grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer'>
                        <p className='text-white'>
                            <b className='mr-4 text-[#a7a7a7]'>{index + 1}</b>
                            <img className='inline w-10 mr-5' src={`http://127.0.0.1:8000/media${item.image}`} alt="" />
                            {item.name}
                        </p>
                        <p className='text-[15px]'>{artist.name}</p>
                        <p className='text-[15px] hidden sm:block'>{album.release_date}</p>
                        <p className='text-[15px] text-center'>{item.duration}</p>
                    </div>
                ))
            }
        </>
    )
}

export default DisplayAlbum