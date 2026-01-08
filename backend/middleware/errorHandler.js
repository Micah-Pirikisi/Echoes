export function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);

  // Handle multer errors
  if (err.name === "MulterError") {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  // Handle custom upload errors
  if (err.message && err.message.includes("image")) {
    return res.status(400).json({ message: err.message });
  }

  res
    .status(err.status || 500)
    .json({ message: err.message || "Server error" });
}
