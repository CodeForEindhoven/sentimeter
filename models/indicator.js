(function() {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var indicator = sequelize.define("indicator", {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      title: DataTypes.STRING
    },{
      paranoid: true
    });
    return indicator;
  };
}());
