'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); // Generate unique Order IDs

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: "userId", onDelete: "CASCADE" });
      Order.belongsTo(models.Product, { foreignKey: "productId", onDelete: "CASCADE" });
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },

      productId: {
        type: DataTypes.INTEGER,
        references: { model: "Products", key: "id" },
        onDelete: "CASCADE",
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      totalAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

    },
    {
      sequelize,
      modelName: "Order",
      timestamps: true,
    }
  );

  return Order;
};
