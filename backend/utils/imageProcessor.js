import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Process and resize product image
export const processProductImage = async (filePath) => {
    try {
        console.log('Processing image:', filePath);
        
        // Ensure the file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const fileName = path.basename(filePath);
        const outputPath = path.join(path.dirname(filePath), fileName.replace(/\.[^.]+$/, '-resized.webp'));
        
        console.log('Output path:', outputPath);
        
        // Resize to standard product image size (400x400px) with optimized quality
        await sharp(filePath)
            .resize(400, 400, {
                fit: 'cover',
                position: 'center',
                background: { r: 255, g: 255, b: 255, alpha: 1 },
            })
            .webp({ quality: 80 })
            .toFile(outputPath);

        console.log('Image processed successfully:', outputPath);

        // Remove original file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Return only the relative path for database storage
        const relativePath = `products/${path.basename(outputPath)}`;
        console.log('Returning relative path:', relativePath);
        return relativePath;
    } catch (error) {
        console.error('Image processing error:', error);
        // If processing fails, return the original file (keep it as-is)
        const relativePath = `products/${path.basename(filePath)}`;
        console.log('Fallback: keeping original file:', relativePath);
        return relativePath;
    }
};

// Generate thumbnail for product listings
export const generateThumbnail = async (filePath) => {
    try {
        const fileName = path.basename(filePath);
        const thumbPath = path.join(path.dirname(filePath), fileName.replace(/\.[^.]+$/, '-thumb.webp'));
        
        await sharp(filePath)
            .resize(150, 150, {
                fit: 'cover',
                position: 'center',
            })
            .webp({ quality: 75 })
            .toFile(thumbPath);

        return thumbPath;
    } catch (error) {
        console.error('Thumbnail generation error:', error);
        return null;
    }
};
