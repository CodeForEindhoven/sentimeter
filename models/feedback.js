(function() {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var feedback = sequelize.define("feedback", {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      session_id: DataTypes.UUID
    },{
      paranoid: true
    });
    return feedback;
  };
}());
