import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadAvatars() {
  const tempDir = path.join(__dirname, "temp-images");
  const files = fs.readdirSync(tempDir);

  const urls = {};

  for (const file of files) {
    const filePath = path.join(tempDir, file);
    const filename = path.parse(file).name.toLowerCase();

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "echoes-avatars",
        public_id: filename,
        overwrite: true,
      });
      urls[filename] = result.secure_url;
      console.log(`✅ ${filename}: ${result.secure_url}`);
    } catch (err) {
      console.error(`❌ Error uploading ${filename}:`, err.message);
    }
  }

  console.log("\n=== URLS FOR SEED.JS ===");
  console.log(JSON.stringify(urls, null, 2));

  return urls;
}

uploadAvatars().catch(console.error);
