'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Gallery extends Model {
    static associate(models) {
    Gallery.belongsTo(models.FileImage, { foreignKey: "fileImageId" });

    }
  }

  Gallery.init(
    {
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Gallery',
      tableName: 'Gallery',
      timestamps: true,
    }
  );

  return Gallery;
};