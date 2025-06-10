import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Gallery, FileImage } from '../models';

// GET /gallery/all
export const getAllGalleries = async (_req: Request, res: Response) => {
  try {
    const galleries = await Gallery.findAll({
      attributes: ['id', 'productId', 'fileImageId'],
      include: [{ model: FileImage, attributes: ['id', 'outputPath'] }],
    });

    if (!galleries.length) {
      return res.status(404).json({ success: false, msg: 'No galleries found.' });
    }

    const grouped = galleries.reduce<Record<string, any[]>>((acc, gallery) => {
      const key = gallery.productId?.toString() || 'unassigned';
      if (!acc[key]) acc[key] = [];

      acc[key].push({
        galleryId: gallery.id,
        fileImageId: gallery.fileImageId,
        imageUrl: gallery.FileImage?.outputPath,
      });

      return acc;
    }, {});

    return res.status(200).json({ success: true, galleries: grouped, msg: 'Galleries retrieved successfully!' });
  } catch (error: any) {
    console.error('Error fetching galleries:', error);
    return res.status(500).json({ success: false, msg: 'Server error while fetching galleries', error: error.message });
  }
};

// GET /gallery/:productId
export const getGalleryByProductId = async (req: Request, res: Response) => {
  const { productId } = req.params;

  try {
    const galleries = await Gallery.findAll({
      where: { productId: productId || null },
      attributes: ['id', 'productId', 'fileImageId'],
      include: [{ model: FileImage, attributes: ['id', 'outputPath'] }],
    });

    if (!galleries.length) {
      return res.status(404).json({ success: false, msg: 'No images found for this product.' });
    }

    const images = galleries.map((g) => ({
      id: g.FileImage?.id,
      imageUrl: g.FileImage?.outputPath,
    }));

    return res.status(200).json({
      productId: productId || 'unassigned',
      images,
      message: 'Images retrieved successfully!',
    });
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return res.status(500).json({ success: false, msg: 'Internal server error', error: error.message });
  }
};

// DELETE /gallery/:productId
export const deleteGalleryByProductId = async (req: Request, res: Response) => {
  const { productId } = req.params;

  try {
    const galleries = await Gallery.findAll({
      where: { productId: productId || null },
      include: [{ model: FileImage, attributes: ['id', 'outputPath'] }],
    });

    if (!galleries.length) {
      return res.status(404).json({ success: false, msg: 'No images found for this product.' });
    }

    const fileIds = galleries.map((g) => g.fileImageId);
    const paths = galleries
      .map((g) => g.FileImage?.outputPath)
      .filter(Boolean)
      .map((p) => path.join('uploads', p!));

    await Gallery.destroy({ where: { productId } });
    await FileImage.destroy({ where: { id: fileIds } });

    paths.forEach((fullPath) => {
      fs.unlink(fullPath, (err) => {
        if (err) console.error('❌ Failed to delete file:', err.message);
      });
    });

    return res.status(200).json({
      success: true,
      msg: 'Gallery and associated images deleted successfully!',
    });
  } catch (error: any) {
    console.error('Error deleting gallery:', error.message);
    return res.status(500).json({ success: false, msg: 'Internal server error', error: error.message });
  }
};
