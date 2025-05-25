'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      this.belongsTo(models.Category, { foreignKey: "categoryId", onDelete: "CASCADE" });
      this.belongsTo(models.Brand, { foreignKey: "brandId", onDelete: "CASCADE" });
      this.belongsTo(models.FileImage, { foreignKey: "cover", as: "CoverImage", onDelete: "SET NULL" });
      this.belongsToMany(models.Subcategory, {
        through: "ProductSubcategories",
        foreignKey: "productId"
      });
    }
  }

  Product.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      brandId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Brands",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cover: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gallery: {
        type: DataTypes.INTEGER,
        references: {
          model: "FileImages", 
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Categories",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      subcategoryIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
      },

      attributes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Product",
      timestamps: true,
    }
  );

  return Product;
};
