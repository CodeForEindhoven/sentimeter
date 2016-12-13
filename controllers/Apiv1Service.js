var models = require('../models');
var util = require('../helpers/utils.js');

(function() {
  'use strict';

  /**
   * GET Details on an Indicator
   *
   * @api {get} /api/indicator/{indicator_id}
   * @param indicator_id (String)
   **/
  exports.indicator_GET = function(args, res, next) {
    var whereClause = {
      where: {
        is_default: true
      }
    };
    if (args.indicator_id) {
      whereClause = {
        where: {
          id: args.indicator_id.value
        }
      };
    }
    models.indicator.findOne(whereClause).then(function(indicator) {
      if (indicator) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(util.removeNulls(indicator) || {}, null, 2));
      } else {
        res.end(JSON.stringify({}, null, 2));
      }
    });
  };

  /**
   * POST a new Indicator
   *
   * @api {post} /api/indicator
   * @param body
   * @example { "title": "The Title of the Indicator"}
   **/
  exports.indicator_POST = function(args, res, next) {
    var response = {};
    if (args.body.value.title) {
      models.indicator.findOrCreate(
        {where: {title: args.body.value.title}}
      ).spread(function(indicator, created) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(util.removeNulls(indicator), null, 2));
      });
    } else {
      response = {
        "status": "fail",
        "message": "No title provided"
      };
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(response, null, 2));
    }
  };

  /**
   * PUT changes to an Indicator
   *
   * @api {put} /api/indicator
   * @param body
   * @example { "title": "The Title of the Indicator"}
   **/
  exports.indicator_PUT = function(args, res, next) {
    var response = {
      "indicator_id": util.getUuid(),
      "status": "ok"
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response, null, 2));
  };

  /**
   * GET Array of Indicator
   *
   * @api {get} /api/indicators
   **/
  exports.indicators_GET = function(args, res, next) {
    models.indicator.findAll().then(function(indicators) {
      if (Object.keys(indicators).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(util.removeNulls(indicators) || [], null, 2));
      } else {
        res.end(JSON.stringify([], null, 2));
      }
    });
  };

  /**
   * POST a Score to an Indicator
   *
   * @api {post} /api/indicator/score
   * @param body
   * @example {
   *            "indicator_id": "indicator_id_1",
   *             "score": 5,
   *            "anonymous_id"
   *          }
   **/
  exports.score_POST = function(args, res, next) {
    var examples = {};
    examples['application/json'] = [{
      "description": "aeiou",
      "id": "aeiou",
      "title": "aeiou"
    }];
    if (Object.keys(examples).length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
      res.end();
    }
  };

  /**
   * POST a vote on a mergeRequest
   *
   * @api {post} /api/indicator/score
   * @param body
   * @example {
   *            "merge_id": "merge_id_1",
   *             "vote": false,
   *            "anonymous_id"
   *          }
   **/
  exports.vote_POST = function(args, res, next) {
    var examples = {};
    examples['application/json'] = [{
      "description": "aeiou",
      "id": "aeiou",
      "title": "aeiou"
    }];
    if (Object.keys(examples).length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
      res.end();
    }
  };

  /**
   * Get Merges
   *
   * @api {get} /api/merges
   **/
  exports.merges_GET = function(args, res, next) {
    var examples = {};
    examples['application/json'] = [{
      "description": "aeiou",
      "id": "aeiou",
      "title": "aeiou"
    }];
    if (Object.keys(examples).length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
      res.end();
    }
  };

  /**
   * POST Request the system to propose a merge of Indicators
   *
   * @api {post} /api/merge
   * @param body
   * @example ["indicator_id_1", "indicator_id_2", ..,  "indicator_id_n"]
   **/
  exports.merge_POST = function(args, res, next) {
    var examples = {};
    examples['application/json'] = [{
      "description": "aeiou",
      "id": "aeiou",
      "title": "aeiou"
    }];
    if (Object.keys(examples).length > 0) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
      res.end();
    }
  };
}());
