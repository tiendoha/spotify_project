// ArtistModal.jsx
import React from 'react';

const ArtistModal = ({ artist, onClose }) => {
  if (!artist) return null;

  const baseUrl = '/media';
  const imageUrl = artist.image ? `${baseUrl}${artist.image}` : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded p-6 w-96 relative text-center">
        <button onClick={onClose} className="absolute top-2 right-3 text-2xl text-gray-600 hover:text-black">×</button>
        {imageUrl ? (
          <img src={imageUrl} alt={artist.name} className="w-32 h-32 rounded-full mx-auto mb-4" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-white">{artist.name?.[0]}</span>
          </div>
        )}
        <h2 className="text-2xl font-bold">{artist.name}</h2>
        <p className="text-gray-600 mt-2">ID: {artist.id}</p>
        {/* Thêm info gì khác của artist nếu cần */}
      </div>
    </div>
  );
};

export default ArtistModal;
