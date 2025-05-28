'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Products", "gallery", {
      type: Sequelize.INTEGER,
      references: {
        model: "Gallery",
        key: "id",
      },
      onDelete: "CASCADE",
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Products", "gallery", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
