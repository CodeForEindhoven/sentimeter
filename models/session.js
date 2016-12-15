(function() {
  'use strict';
  module.exports = function(sequelize, DataTypes) {
    var session = sequelize.define("session", {
      identity_id: DataTypes.STRING,
      session_id: DataTypes.STRING
    });
    return session;
  };
}());
