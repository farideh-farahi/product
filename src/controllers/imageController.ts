import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { FileImage } from '../models';

// Upload Image(s)
export const uploadImage = async (req: Request, res: Response) => {
  const userId = (req as any).user?.user_id;
  const files = req.files as Express.Multer.File[];

  if (!files?.length) {
    return res.status(400).json({ success: false, msg: 'No files uploaded' });
  }

  const oversized = files.filter(f => f.size > 500 * 1024);
  if (oversized.length) {
    return res.status(400).json({
      success: false,
      msg: 'Some files exceed the 500 KB limit',
      oversizedFiles: oversized.map(f => f.originalname),
    });
  }

  const savedImages = [];

  try {
    await Promise.all(
      files.map(async (file) => {
        const originalPath = `uploads/${Date.now()}-original.webp`;
        const tinyPath = `uploads/${Date.now()}-tiny.webp`;

        fs.renameSync(file.path, originalPath);

        await sharp(originalPath)
          .resize({ width: 100 })
          .webp({ quality: 80 })
          .toFile(tinyPath);

        const fileImage = await FileImage.create({
          userId,
          outputPath: path.basename(originalPath),
        });

        savedImages.push({
          fileImageId: fileImage.id,
          originalImagePath: path.basename(originalPath),
          tinyImagePath: path.basename(tinyPath),
        });
      })
    );

    return res.status(201).json({
      success: true,
      msg: 'Files uploaded successfully',
      uploadedImages: savedImages,
    });
  } catch (err: any) {
    console.error('Error uploading images:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server error while uploading images',
      error: err.message,
    });
  }
};

// Get All Photos
export const getAllPhotos = async (_req: Request, res: Response) => {
  try {
    const photos = await FileImage.findAll({
      attributes: ['id', 'outputPath'],
      order: [['id', 'ASC']],
    });

    if (!photos.length) {
      return res.status(404).json({ success: false, msg: 'No photos found.' });
    }

    const results = photos.map((p) => ({
      fileImageId: p.id,
      imageUrl: p.outputPath,
    }));

    return res.status(200).json({
      success: true,
      photos: results,
      msg: 'Photos retrieved successfully!',
    });
  } catch (err: any) {
    console.error('Error fetching photos:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server error while fetching photos',
      error: err.message,
    });
  }
};

// Get Photo by ID
export const getImageById = async (req: Request, res: Response) => {
  const { imageId } = req.params;

  try {
    const image = await FileImage.findByPk(imageId);
    if (!image) {
      return res.status(404).json({ success: false, msg: 'Image not found.' });
    }

    return res.status(200).json({
      success: true,
      fileImageId: image.id,
      imageUrl: image.outputPath,
      msg: 'Image retrieved successfully!',
    });
  } catch (err: any) {
    console.error('Error fetching image:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server error while fetching image',
      error: err.message,
    });
  }
};

// Get Images by User ID
export const getImageByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const images = await FileImage.findAll({
      where: { userId },
      attributes: ['id', 'outputPath'],
    });

    if (!images.length) {
      return res.status(404).json({
        success: false,
        msg: 'No images found for this user.',
      });
    }

    return res.status(200).json({
      success: true,
      userId,
      images,
      msg: 'User images retrieved successfully!',
    });
  } catch (err: any) {
    console.error('Error fetching user images:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server error while fetching user images',
      error: err.message,
    });
  }
};

// Replace Image
export const replaceImage = async (req: Request, res: Response) => {
  const { fileImageId } = req.params;
  const uploaded = req.file;

  if (!uploaded) {
    return res.status(400).json({ success: false, msg: 'No file uploaded' });
  }

  try {
    const image = await FileImage.findByPk(fileImageId);
    if (!image) {
      return res.status(404).json({ success: false, msg: 'Image not found' });
    }

    const oldPath = `uploads/${image.outputPath}`;
    await image.update({ outputPath: uploaded.filename });

    fs.unlink(oldPath, (err) => {
      if (err) console.error('Error deleting old file:', err.message);
    });

    return res.status(200).json({
      success: true,
      fileImageId: image.id,
      newImageUrl: uploaded.filename,
      msg: 'Image replaced successfully!',
    });
  } catch (err: any) {
    console.error('Error replacing image:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server error while replacing image',
      error: err.message,
    });
  }
};

// Delete Image
export const deleteImage = async (req: Request, res: Response) => {
  const { fileImageId } = req.params;

  try {
    const image = await FileImage.findByPk(fileImageId);
    if (!image) {
      return res.status(404).json({ success: false, msg: 'Image not found.' });
    }

    const imagePath = `uploads/${image.outputPath}`;
    await image.destroy();

    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting file from disk:', err.message);
    });

    return res.status(200).json({ success: true, msg: 'Image deleted successfully!' });
  } catch (err: any) {
    console.error('Error deleting image:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server error while deleting image',
      error: err.message,
    });
  }
};
