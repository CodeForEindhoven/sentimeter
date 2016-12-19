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
    }).then(function() {
      models.session.create(
        response
      ).then(function(session, created) {
        var output = {
          "identity_id": session.identity_id,
          "session_id": session.session_id
        };
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
    var whereClause;

    if (req.swagger.params.indicator_id) {
      whereClause = {
        include: [{
          model: models.score,
          attributes: [
            [models.sequelize.fn('MIN', models.sequelize.col('score')), 'minimum'],
            [models.sequelize.fn('MAX', models.sequelize.col('score')), 'maximum'],
            [models.sequelize.fn('AVG', models.sequelize.col('score')), 'average'],
            [models.sequelize.fn('COUNT', models.sequelize.col('score')), 'scores']
          ]
        }],
        where: {
          id: req.swagger.params.indicator_id.value
        }
      };
    }
    models.indicator.findOne(whereClause).then(function(indicator) {
      if (indicator) {
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
      models.indicator.findOrCreate({
        where: {
          title: req.swagger.params.body.value.title
        }
      }).spread(function(indicator, created) {
        res.end(JSON.stringify(util.removeNulls(indicator), null, 2));
      });
    } else {
      response = {
        "status": "fail",
        "message": "No title provided"
      };

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

    var err_fields = [];
    if (!req.swagger.params.body.value.indicator_id) {
      err_fields.push("indicator_id");
    }
    if (!req.swagger.params.body.value.session_id) {
      err_fields.push("indicator_id");
    }
    if (!req.swagger.params.body.value.score) {
      err_fields.push("score");
    }
    if (parseInt(req.swagger.params.body.value.score) < 0 || parseInt(req.swagger.params.body.value.score) > 10) {
      err_fields.push("score");
    }

    if (err_fields.length > 0) {
      return util.catchError(req, res, {
        "code": 400,
        "name": "fieldErrors",
        "message": "Some fields are missing or wrong",
        "fields": err_fields
      });
    }

    //Is the score between 0 and 10?

    //Is the session valid?
    models.session.findOne({
      where: {
        session_id: req.swagger.params.body.value.session_id
      }
    }).then(function(session) {

      // Try to write Identity_id, Indicator_Id and score.
      if (!session) {
        return util.catchError(req, res, {
          "code": 400,
          "name": "noSession",
          "message": "You do not have a valid session",
          "fields": ["session_id"]
        });
      } else {
        var tScore = {
          identity_id: session.identity_id,
          indicator_id: req.swagger.params.body.value.indicator_id,
          score: parseInt(req.swagger.params.body.value.score)
        };
        var where = {
          identity_id: tScore.identity_id,
          indicator_id: tScore.indicator_id
        };
        var resultQuery = {
          where: {
            "indicator_id": tScore.indicator_id
          },
          attributes: [
            [models.sequelize.fn('MIN', models.sequelize.col('score')), 'minimum'],
            [models.sequelize.fn('MAX', models.sequelize.col('score')), 'maximum'],
            [models.sequelize.fn('AVG', models.sequelize.col('score')), 'average'],
            [models.sequelize.fn('COUNT', models.sequelize.col('score')), 'scores']
          ]
        };
        models.score.findOne({
          where: where
        }).then(function(foundItem) {
          if (!foundItem) {
            // Item not found, create a new one
            models.score.create(tScore)
              .then(function(result) {
                models.score.findAll(resultQuery).then(function(result) {
                  //return score created, indicator, number of scores on this indicator, average, max, min
                  res.end(JSON.stringify(result || {}, null, 2));
                });
              })
              .error(function(err) {
                util.catchError(req, res, err);
              });
          } else {
            // Found an item, update it
            models.score.update(tScore, {
                where: where
              })
              .then(function(result) {
                models.score.findAll(resultQuery).then(function(result) {
                  //return score created, indicator, number of scores on this indicator, average, max, min
                  res.end(JSON.stringify(result || {}, null, 2));
                });
              })
              .catch(function(err) {
                util.catchError(req, res, err);
              });
          }
        }).catch(function(err) {
          return util.catchError(req, res, err);
        });
      }
    });
  };

  /**
   * POST a vote on a mergeRequest
   *
   * @api {post} /api/merge/vote
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
      res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
      res.end();
    }
  };
}());
