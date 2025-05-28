'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("FileImages", {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: Sequelize.INTEGER, references: { model: "Users", key: "id" }, onDelete: "CASCADE", allowNull: false },
  outputPath: { type: Sequelize.STRING, allowNull: false },
  createdAt: { type: Sequelize.DATE, allowNull: false },
  updatedAt: { type: Sequelize.DATE, allowNull: false }
});

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('FileImages');
     
  }
};
