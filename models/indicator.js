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
      title: {
        type: DataTypes.STRING //,
        //i18n: true
      }
    },{
      classMethods: {
        associate: function(models) {
          indicator.hasMany(models.score,{foreignKey: 'indicator_id'});
        }
      },
      paranoid: true
    });
    return indicator;
  };
}());
