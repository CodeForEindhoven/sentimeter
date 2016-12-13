(function() {
  'use strict';

  var url = require('url');


  var Apiv1 = require('./Apiv1Service');


  module.exports.indicatorIndicator_idGET = function indicatorIndicator_idGET(req, res, next) {
    Apiv1.indicatorIndicator_idGET(req.swagger.params, res, next);
  };

  module.exports.indicatorPOST = function indicatorPOST(req, res, next) {
    Apiv1.indicatorPOST(req.swagger.params, res, next);
  };

  module.exports.indicatorPUT = function indicatorPUT(req, res, next) {
    Apiv1.indicatorPUT(req.swagger.params, res, next);
  };

  module.exports.indicatorsGET = function indicatorsGET(req, res, next) {
    Apiv1.indicatorsGET(req.swagger.params, res, next);
  };

  module.exports.mergePUT = function mergePUT(req, res, next) {
    Apiv1.mergePUT(req.swagger.params, res, next);
  };
}());
