(function() {
  'use strict';
  module.exports = {
    up: function(queryInterface, Sequelize) {
      return queryInterface.createTable('attendees', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER.UNSIGNED
        },
        event_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        identity_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM,
          values: ['SENT', 'ACCEPTED', 'DECLINED'],
          defaultValue: 'SENT'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
        deletedAt: Sequelize.DATE
      });
    },
    down: function(queryInterface, Sequelize) {
      return queryInterface.dropTable('attendees');
    }
  };
}());
