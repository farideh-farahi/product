'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Subcategory, {foreignKey:'categoryId', onDelete : "CASCADE"})
      Category.hasMany(models.Product, {foreignKey: "categoryId", onDelete : "CASCADE"})
    }
  }
  Category.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
      },
      is_active: {
        type: DataTypes.BOOLEAN, 
        allowNull: false,
        defaultValue: true
    }
    },
    {
    sequelize,
    modelName: 'Category',
    timestamps: true
  });
  return Category;
};