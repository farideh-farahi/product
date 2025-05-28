'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Gallery extends Model {
    static associate(models) {
    Gallery.belongsTo(models.FileImage, { foreignKey: "fileImageId" });
    Gallery.belongsTo(models.Product,{foreignKey: "productId"})

    }
  }

  Gallery.init(
    {
      fileImageId:{ 
        type: DataTypes.INTEGER,
        references: {
          model: "FileImages",
          key: "id"
      },
    },
      productId:{
       type: DataTypes.INTEGER,
       references:{
        model: "Products",
        key:"id"
       }
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