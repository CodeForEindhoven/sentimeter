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
        indicator_id: {type: Sequelize.STRING, allowNull: false},
        identity_id: {type: Sequelize.STRING, allowNull: false},
        score: {type: Sequelize.INTEGER, allowNull: false},
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
