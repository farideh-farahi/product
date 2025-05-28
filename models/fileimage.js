'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
class FileImage extends Model {
  static associate(models) {
    FileImage.belongsTo(models.User, { foreignKey: "userId", onDelete: "CASCADE" });
    FileImage.hasOne(models.Gallery, { foreignKey: "fileImageId", onDelete: "CASCADE" });
    FileImage.hasOne(models.Product, {foreignKey: "cover", onDelete: "SET NULL"})
  }
}

FileImage.init({
    userId: { type: DataTypes.INTEGER, allowNull: false },
    outputPath: DataTypes.STRING,
}, {
    sequelize,
    modelName: 'FileImage',
    timestamps: true
});


  return FileImage;
};