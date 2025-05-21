'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "gallery", {
      type: Sequelize.INTEGER,
      references: {
        model: "Gallery",
        key: "id",
      },
      onDelete: "CASCADE",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "gallery");
  }

  }
