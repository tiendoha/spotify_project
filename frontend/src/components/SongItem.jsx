import React, { useContext } from 'react'
import { TrackContext } from '../context/PlayerContext'

const SongItem = ({ name, image, artist_name, id }) => {

    const { playTrackById } = useContext(TrackContext);
    const baseUrl = 'http://127.0.0.1:8000/media';
    const imageUrl = image ? `${baseUrl}${image}` : '';

    return (
        <div onClick={() => playTrackById(id)} className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
            <img className="rounded" src={imageUrl} alt={name} onError={() => console.log(`Failed to load image for ${name}`)} />
            <p className='font-bold mt-2 mb-1'>{name}</p>
            <p className='text-slate-200 text-sm'>{artist_name}</p>
        </div>
    )
}

export default SongItem