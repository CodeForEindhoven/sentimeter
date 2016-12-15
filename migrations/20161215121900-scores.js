(function() {
  'use strict';
  module.exports = {
    up: function(queryInterface, Sequelize) {
      return queryInterface.createTable('scores', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER.UNSIGNED
        },
        indicator_id: Sequelize.STRING,
        identity_id: Sequelize.STRING,
        score: Sequelize.INTEGER,
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
        deletedAt: Sequelize.DATE
      });
    },
    down: function(queryInterface, Sequelize) {
      return queryInterface.dropTable('scores');
    }
  };
}());
