import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../src/config/cloudinary.js";
import { ensureAuthenticated } from "../middleware/auth.js";
import { uploadImage } from "../controllers/uploadController.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "echoes",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

const router = Router();

router.post("/image", ensureAuthenticated, upload.single("image"), uploadImage);

export default router;
