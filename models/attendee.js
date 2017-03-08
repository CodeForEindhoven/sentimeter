(function() {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var attendee = sequelize.define("attendee", {
      event_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      identity_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM,
        values: ['SENT', 'ACCEPTED', 'DECLINED'],
        defaultValue: 'SENT'
      },
    }, {
      paranoid: true
    });
    return attendee;
  };
}());
