'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subcategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Subcategory.belongsTo(models.Category,{foreignKey: "categoryId", onDelete: "CASCADE"})
      Subcategory.belongsToMany(models.Product,{
        through: "ProductSubcategories",
        foreignKey: "subcategoryId"
      })
    }
  }
  Subcategory.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Categories",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  
  }, {
    sequelize,
    modelName: 'Subcategory',
    timestamps: true
  });
  return Subcategory;
};