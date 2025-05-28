'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Gallery',
      { 
        id:{ type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        fileImageId: { type: Sequelize.INTEGER, references: { model: "FileImages", key: "id"}, onDelete: "CASCADE"},
        productId: { type: Sequelize.INTEGER, references: { model: "Products", key: "id"}, onDelete: "SET NULL" },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Gallery');
  }
};
