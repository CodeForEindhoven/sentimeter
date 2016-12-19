(function() {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var Sequelize = require('sequelize');
  var SequelizeI18N = require('sequelize-i18n');
  var basename = path.basename(module.filename);
  var env = process.env.NODE_ENV || 'development';
  var config = require(__dirname + '/../config/config.json')[env];
  var db = {};
  var sequelize;
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable]);
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
  }
  var i18n = new SequelizeI18N( sequelize, { languages: config.languages.list, default_language: config.languages.default } );
  i18n.init();
  fs
    .readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function(file) {
      var model = sequelize['import'](path.join(__dirname, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  module.exports = db;
}());
