(function() {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var member = sequelize.define("member", {
      parent_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      identity_id: {
        type: DataTypes.UUID,
        allowNull: false
      }
    }, {
      paranoid: true
    });
    return member;
  };
}());
