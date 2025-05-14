'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductSubcategory extends Model {
    static associate(models) {
      this.belongsTo(models.Product, { foreignKey: "productId", onDelete: "CASCADE" });
      this.belongsTo(models.Subcategory, { foreignKey: "subcategoryId", onDelete: "CASCADE" });
    }
  }

  ProductSubcategory.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Products",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      subcategoryId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Subcategories",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: 'ProductSubcategory',
      timestamps: true,
    }
  );

  return ProductSubcategory;
};