import config from './config.js';

export async function uploadImage(file) {
    try {
        console.log("Starting image upload to Cloudinary...");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', config.cloudinary.uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Upload successful, URL:", data.secure_url);

        return data.secure_url;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}
