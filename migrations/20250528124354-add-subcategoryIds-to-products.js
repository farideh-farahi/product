'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "subcategoryIds", {
      type: Sequelize.ARRAY(Sequelize.INTEGER), // ✅ Store multiple subcategory IDs
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "subcategoryIds");
  }
};
