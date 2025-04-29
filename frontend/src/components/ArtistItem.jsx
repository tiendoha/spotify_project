import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArtistItem = ({ image = '', name = 'Unknown', id }) => {
  const navigate = useNavigate();
  const baseUrl = 'http://127.0.0.1:8000/media';
  const imageUrl = image ? `${baseUrl}${image}` : '';

  return (
    <div
      onClick={() => navigate(`/artist/${id}`)}
      className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] flex flex-col items-center"
    >
      {imageUrl ? (
        <img
          className="rounded-full max-w-[180px] p-2"
          src={imageUrl}
          alt={name}
          onError={() => console.log(`Failed to load image for ${name}`)}
        />
      ) : (
        <div className="rounded-full max-w-[180px] p-2 bg-gray-700 flex items-center justify-center">
          <span className="text-2xl text-white">{name[0]}</span>
        </div>
      )}
      <p className="font-bold mt-2 mb-1 text-left w-full text-white">{name}</p>
      <p className="mb-1 text-left w-full text-gray-400">Artist</p>
    </div>
  );
};

export default ArtistItem;