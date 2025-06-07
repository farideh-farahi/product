'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Brand, { foreignKey: "brandId", onDelete: "CASCADE" });
      Product.belongsTo(models.FileImage, { foreignKey: "cover",as: "CoverImage", onDelete: "SET NULL" });
      Product.hasMany(models.Gallery, {foreignKey:"productId", as: "Galleries", onDelete :"SET NULL"})
      Product.belongsTo(models.Category, { foreignKey: "categoryId", onDelete: "CASCADE" });
      Product.belongsToMany(models.Subcategory, {
        through: "ProductSubcategories",
        foreignKey: "productId"
      });
      Product.hasMany(models.Order, { foreignKey: "productId", onDelete: "CASCADE" });
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
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
          model: "FileImages",
          key: "id"
        }
      },

      gallery: {
        type: DataTypes.INTEGER,
        references: {
          model: "Gallery", 
          key: "id",
        },
        onDelete: "SET NULL",
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
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      inventory: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
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
