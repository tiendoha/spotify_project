import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'
import axios from "axios";
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'
import ArtistItem from './ArtistItem'
const DisplayHome = () => {
    const [albums, setAlbums] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [artists, setArtists] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [albumsRes, tracksRes, artistsRes] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/albums/'),
                    axios.get('http://127.0.0.1:8000/api/tracks/'),
                    axios.get('http://127.0.0.1:8000/api/artists/'),
                ]);
                setAlbums(albumsRes.data);
                setTracks(tracksRes.data);
                setArtists(artistsRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);
    const getArtistName = (artistId) => {
        const artist = artists.find((a) => a.id === artistId);
        return artist ? artist.name : 'Unknown Artist';
    };
    return (
        <>
            <Navbar />
            <div className='mb-4'>
                <h1 className='my-5 font-bold text-2xl'>Top Artists</h1>
                <div className="flex overflow-auto">
                    {artists.map((item) => (<ArtistItem key={item.id} name={item.name} id={item.id} image={item.image} />))}
                </div>
            </div>
            <div className="mb-4">
                <h1 className='my-5 font-bold text-2xl'>Featured Charts</h1>
                <div className="flex overflow-auto">
                    {albums.map((item) => (<AlbumItem key={item.id} name={item.name} desc={item.release_date} artist_name={getArtistName(item.artist)} id={item.id} image={item.image} />))}
                </div>
            </div>
            <div className="mb-4">
                <h1 className='my-5 font-bold text-2xl'>Today's biggest hits</h1>
                <div className="flex overflow-auto">
                    {tracks.map((item) => (<SongItem key={item.id} name={item.name} artist_name={getArtistName(item.artist)} id={item.id} image={item.image} />))}
                </div>
            </div>
        </>
    )
}

export default DisplayHome