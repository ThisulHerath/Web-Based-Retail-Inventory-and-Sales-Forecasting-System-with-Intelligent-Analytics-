// Get the backend API base URL
const getBackendBaseURL = () => {
    // Vite env vars are exposed on import.meta.env, not process.env.
    const envBase = import.meta.env.VITE_BACKEND_URL;
    if (envBase && typeof envBase === 'string') {
        return envBase.replace(/\/$/, '');
    }

    // Default backend URL for local development.
    return 'http://localhost:5000';
};

// Construct full image URL from relative path
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Support both "products/file.webp" and "/uploads/products/file.webp" formats.
    const normalizedPath = imagePath
        .replace(/^\/+/, '')
        .replace(/^uploads\//, '');

    const baseURL = getBackendBaseURL();
    return `${baseURL}/uploads/${normalizedPath}`;
};

export default getImageUrl;
