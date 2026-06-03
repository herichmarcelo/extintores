import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (fileUri: string, folder: string) => {
  try {
    const res = await cloudinary.uploader.upload(fileUri, {
      folder: `bello-alimentos/${folder}`,
    });
    return res.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
};

export default cloudinary;
