const CLOUD_NAME = "dfshnr08w";
const UPLOAD_PRESET = "CampusOlx";

export async function uploadImage(file) {
    try {
        console.log("Starting image upload to Cloudinary...");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
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
