'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Gallery", "fileImageId", {
      type: Sequelize.INTEGER,
      references: {
        model: "FileImages", // ✅ Ensures association with FileImages table
        key: "id",
      },
      onDelete: "CASCADE",
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Gallery", "fileImageId");
  }
};
