'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FileImage extends Model {
    static associate(models) {
      FileImage.belongsTo(models.User,{foreignKey:"userId", onDelete:"CASCADE"})
    }
  }
  FileImage.init({
    userId: { type: DataTypes.INTEGER, allowNull: false },
    outputPath: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'FileImage',
    timestamps: true,
  });

  return FileImage;
};