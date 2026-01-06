import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";
import { ensureAuthenticated } from "../middleware/auth.js";
import { uploadImage } from "../controllers/uploadController.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "odin-book",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.post("/image", ensureAuthenticated, upload.single("image"), uploadImage);

export default router;
