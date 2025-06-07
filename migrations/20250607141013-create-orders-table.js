'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Orders", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      orderId: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      userId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },

      productId: {
        type: Sequelize.INTEGER,
        references: { model: "Products", key: "id" },
        onDelete: "CASCADE",
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      totalAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Orders");
  },
};
