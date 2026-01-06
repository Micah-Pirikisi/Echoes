export const uploadImage = (req, res) => {
  res.json({ url: req.file.path });
};
