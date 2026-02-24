// Get the backend API base URL
const getBackendBaseURL = () => {
    // For development, use localhost:5000
    // For production, this can be replaced with an environment variable
    if (process.env.NODE_ENV === 'production') {
        // In production, you can use environment variable or relative path
        return process.env.REACT_APP_BACKEND_URL || window.location.origin.replace(':3000', ':5000');
    }
    return 'http://localhost:5000';
};

// Construct full image URL from relative path
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    const baseURL = getBackendBaseURL();
    return `${baseURL}/uploads/${imagePath}`;
};

export default getImageUrl;
