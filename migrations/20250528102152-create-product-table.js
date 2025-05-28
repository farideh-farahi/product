'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      brandId: { type: Sequelize.INTEGER, references: { model: "Brands", key: "id" }, onDelete: "CASCADE" },
      price: { type: Sequelize.INTEGER, allowNull: false },
      cover: { type: Sequelize.INTEGER, references: { model: "FileImages", key: "id" }, onDelete: "SET NULL", allowNull: true },
      gallery: {type: Sequelize.INTEGER,allowNull: true},
      categoryId: { type: Sequelize.INTEGER, references: { model: "Categories", key: "id" }, onDelete: "CASCADE" },
      status: { type: Sequelize.INTEGER, allowNull: false },
      attributes: { type: Sequelize.JSON, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Products");
  }
};
