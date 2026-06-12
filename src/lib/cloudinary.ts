import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File, folder = 'chat'): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(base64, { folder });
  return result.secure_url;
}

export { cloudinary };
