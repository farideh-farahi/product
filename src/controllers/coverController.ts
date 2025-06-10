import { Request, Response } from 'express';
import { Product, FileImage } from '../models';

export const getProductCover = async (req: Request, res: Response) => {
  const { productId } = req.params;

  try {
    const product = await Product.findByPk(productId, {
      attributes: ['id', 'name', 'cover'],
      include: [
        {
          model: FileImage,
          as: 'CoverImage',
          attributes: ['id', 'outputPath'],
        },
      ],
    });

    if (!product || !product.CoverImage) {
      return res
        .status(404)
        .json({ success: false, msg: 'Cover image not found for this product.' });
    }

    return res.status(200).json({
      success: true,
      productId,
      productName: product.name,
      coverImageUrl: product.CoverImage.outputPath,
      msg: 'Cover image retrieved successfully!',
    });
  } catch (error: any) {
    console.error('Error fetching product cover:', error.message);
    return res.status(500).json({
      success: false,
      msg: 'Server error while fetching cover image',
      error: error.message,
    });
  }
};
