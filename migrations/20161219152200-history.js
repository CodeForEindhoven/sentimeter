(function() {
  'use strict';
  module.exports = {
    up: function(queryInterface, Sequelize) {
      return queryInterface.createTable('histories', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER.UNSIGNED
        },
        model: {
          type: Sequelize.ENUM,
          values: ['indicator', 'score']
        },
        string_value: Sequelize.STRING,
        integer_value: Sequelize.INTEGER,
        parent_id: Sequelize.UUID,
        identity_id: Sequelize.UUID,
        operation: {
          type: Sequelize.ENUM,
          values: ['CREATE', 'UPDATE', 'DELETE', 'MERGE']
        },
        stamp: Sequelize.DATE
      });
    },
    down: function(queryInterface, Sequelize) {
      return queryInterface.dropTable('histories');
    }
  };
}());
