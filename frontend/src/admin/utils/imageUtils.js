const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return ''; // Return empty string if no image

  // If the path is already a full URL, return it as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Remove leading slash if exists
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  // Combine with media URL
  return `${BASE_URL}/media/${cleanPath}`;
};