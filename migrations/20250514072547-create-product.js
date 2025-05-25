'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      brandId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Brands",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      categoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Categories",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      subcategoryIds: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true,
      },

      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cover: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      attributes:{
        type: Sequelize.STRING,
       },
      gallery: {
        type: Sequelize.INTEGER,
        references: {
          model: "FileImages", 
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};