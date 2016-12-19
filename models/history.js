(function() {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var history = sequelize.define("history", {
      model: {
        type: DataTypes.ENUM,
        values: ['indicator', 'score']
      },
      string_value: DataTypes.STRING,
      integer_value: DataTypes.INTEGER,
      parent_id: DataTypes.UUID,
      identity_id: DataTypes.UUID,
      operation: {
        type: DataTypes.ENUM,
        values: ['CREATE', 'UPDATE', 'DELETE', 'MERGE']
      },
      stamp: DataTypes.DATE
    },{
      timestamps: false
    });
    return history;
  };
}());
