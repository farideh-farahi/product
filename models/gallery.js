'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Gallery extends Model {
    static associate(models) {
      this.belongsTo(models.Product, { foreignKey: "productId", onDelete: "CASCADE" });
    }
  }

  Gallery.init(
    {
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
      },
      productId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Products",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: 'Gallery',
      timestamps: true,
    }
  );

  return Gallery;
};