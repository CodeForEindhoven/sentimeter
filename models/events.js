(function() {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var event = sequelize.define("event", {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      summary: DataTypes.STRING,
      location: DataTypes.STRING,
      description: DataTypes.STRING,
      start: DataTypes.DATE,
      end: DataTypes.DATE
    },{
      classMethods: {
        associate: function(models) {
          event.hasMany(models.attendee,{foreignKey: 'event_id'});
        }
      },
      paranoid: true
    });
    return event;
  };
}());
