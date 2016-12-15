(function() {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var score = sequelize.define("score", {
      indicator_id: DataTypes.STRING,
      identity_id: DataTypes.STRING,
      score: {type: DataTypes.INTEGER,
        validate: {
          min: 0,
          max: 10
        }
      }
    }, {
      classMethods: {
        associate: function(models) {
          score.belongsTo(models.indicator,{foreignKey: 'indicator_id'});
        }
      }
    });
    return score;
  };
}());
