var models = require('../models');
var util = require('../helpers/utils.js');

(function() {
  'use strict';
  /**
   * POST Handshake
   *
   * @api {post} /api/handshake
   * @param body
   * @example {} or {"identity_id": "identity_id_1"}
   **/
  module.exports.handshake_POST = function(req, res, next) {
    console.log(req.swagger.params.body.value.identity_id);
    var response = {
      "identity_id": req.swagger.params.body.value.identity_id || util.getUuid(),
      "session_id": util.getUuid()
    };
    // Invalidate all sessions for this identity and return a new session.
    models.session.destroy({
      where: {
        identity_id: response.identity_id
      }
    }).then(function(){
      models.session.create(
        response
      ).then(function(session, created){
        res.setHeader('Content-Type', 'application/json');
        var output = {"session_id": session.session_id};
        res.end(JSON.stringify(output, null, 2));
      });
    });
  };

  /**
   * GET Details on an Indicator
   *
   * @api {get} /api/indicator/{indicator_id}
   * @param indicator_id (String)
   **/
  module.exports.indicator_GET = function(req, res, next) {
    var whereClause = {
      where: {
        is_default: true
      }
    };
    if (req.swagger.params.indicator_id) {
      whereClause = {
        where: {
          id: req.swagger.params.indicator_id.value
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
  module.exports.indicator_POST = function(req, res, next) {
    var response = {};
    if (req.swagger.params.body.value.title) {
      models.indicator.findOrCreate(
        {where: {title: req.swagger.params.body.value.title}}
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
  module.exports.indicator_PUT = function(req, res, next) {
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
  module.exports.indicators_GET = function(req, res, next) {
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
   *            "identity_id"
   *          }
   **/
  module.exports.score_POST = function(req, res, next) {
    //session needs to be valid. If it is, vote with the given identity
    // Parameters: Session (Used to retrieve Identity), Indicator_id to vote on and score.

    //Is the session valid?

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
  module.exports.vote_POST = function(req, res, next) {
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
  module.exports.merges_GET = function(req, res, next) {
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
  module.exports.merge_POST = function(req, res, next) {
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
