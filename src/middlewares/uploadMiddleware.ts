import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomString}${ext}`);
  },
});

const upload = multer({ storage });

export const convertToWebP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) return next();

  try {
    await Promise.all(
      files.map(async (file) => {
        const inputPath = file.path;
        const outputPath = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

        await sharp(inputPath).toFormat('webp').toFile(outputPath);

        file.path = outputPath;
        file.filename = path.basename(outputPath);

        fs.unlink(inputPath, (err) => {
          if (err) console.error('Error deleting original file:', err);
        });
      })
    );
  } catch (error: any) {
    console.error('Error converting images to WebP:', error.message);
    return res.status(500).json({ error: 'Failed to process images' });
  }

  next();
};

export default upload;
