const { Brand } = require("../models")

const createBrand = async (req, res) => {
    const { name } = req.body
    if(!name){
        return res.status(400).json({ success: false, msg: "Invalid or missing required fields!" });
     }
     try {
        const existingBrand = await Brand.findOne({ where: { name } });
        if (existingBrand) {
            return res.status(409).json({ success: false, msg: "Brand name already exists!" });
        }

        const newBrand = await Brand.create({ name });
        return res.status(201).json({ success: true, msg: "Brand created successfully!", brand: newBrand });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Server error while creating Brand", error: err.message });
    }
}

const getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.findAll({});

        if (brands.length === 0) {
            return res.status(200).json({ success: true, msg: "No brands found" });
        }

        return res.status(200).json({ success: true, brands });
    } catch (err) {
       return res.status(500).json({ success: false, msg: "Server error while retrieving Brands", error: err.message });
    }
};

const updateBrand = async (req, res) => {
    const brand_id = req.params.id;
    const { name } = req.body;
  
    if(!name){
        return res.status(400).json({ success: false, msg: "Invalid or missing required fields!" })
    }
    try {
      const brand = await Brand.findOne({ where: { id: brand_id } });
      if (!brand) {
        return res.status(404).json({ success: false, msg: "brand not found!" });
    }
      await brand.update({ name });
  
      return res.json({ success: true, msg: "brand updated successfully!", brand });
    } catch (err) {
      return res.status(500).json({ success: false, msg: "Server error while updating brand", error: err.message });
    }
  };

  const deleteBrand = async (req, res) => {
    const brand_id = req.params.id;
 
    try{
        const brand = await Brand.findOne({ where: { id: brand_id } });
       if(!brand){
          return res.status(404).json({success: false, msg:"brand not found"})
       }
       await brand.destroy();
       return res.json({ success: true, msg: "brand deleted successfully!" });
 
    }catch(err){
      return res.status(500).json({ success: false, msg: "Server error while deleting brand", error: err.message });
    }
 }

module.exports = {
  createBrand, 
  getAllBrands, 
  updateBrand, 
  deleteBrand}