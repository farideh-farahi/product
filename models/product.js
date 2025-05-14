'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      this.belongsTo(models.Category, {foreignKey: "categoryId", onDelete: "CASCADE"})
      this.belongsTo(models.Brand, {foreignKey: "brandId", onDelete: "CASCADE"})
      this.hasMany(models.Gallery, {foreignKey: "productId", onDelete: "CASCADE"})
      this.belongsToMany(models.Subcategory,{
        through: "ProductSubcategories",
        foreignKey: "productId"
    })
    }
  }
  Product.init(
    {
    name:{
      type: DataTypes.STRING,
      allowNull:false,
      unique: true,
   },
   brandId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Brands',
      key: 'id',
    },
    onDelete: "CASCADE",
  },
   price: {
      type: DataTypes.INTEGER,
      allowNull: false
   },
   cover: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

   categoryId: {
    type: DataTypes.INTEGER,
    references:{
      model: "Categories",
      key: "id"
    },
    onDelete: "CASCADE",
   },

   attributes:{
    type: DataTypes.STRING,
   },

  }, {
    sequelize,
    modelName: 'Product',
    timestamps: true
  });

  return Product;
};