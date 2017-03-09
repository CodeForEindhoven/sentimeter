var models = require('../models');
var util = require('../helpers/utils.js');
var moment = require('moment-timezone');

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
    res.setHeader('content-type', 'application/json');
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
      models.session.create(response).then(function(session) {
        var output = {
          "identity_id": session.identity_id,
          "session_id": session.session_id
        };
        // Group member?
        models.member.findOne({
          where: {
            identity_id: session.identity_id
          }
        }).then(function(membership) {
          var whereclause = {1: 1};
          var member = false;
          if (membership) {
            member = true;
            whereclause = {"parent_id": membership.parent_id};
          }
          //select or create a group
          models.member.findAll({
            attributes: [
              'parent_id', [models.sequelize.fn('count', models.sequelize.col('identity_id')), 'cnt']
            ],
            having: models.sequelize.where(
              models.sequelize.fn('count'),
              "<=",
              3
            ),

            order: [
              [models.sequelize.fn('count', models.sequelize.col('identity_id')), 'DESC']
            ],
            group: [
              "parent_id"
            ]
          }).then(function(result) {
            if (!result || result.length === 0) {
              //create a new group
              models.member.create({
                identity_id: session.identity_id
              }).then(function(result2) {
                output.group = {"id": result2.parent_id, "members": 1};
                res.end(JSON.stringify(output, null, 2));
              });
            } else {
              var groupIdx = Math.floor(Math.random() * (result.length));
              if(!member){
                models.member.create({
                  identity_id: session.identity_id,
                  parent_id: result[groupIdx].parent_id
                }).then(function(result2) {
                  output.group = {
                    "id":result2.parent_id,
                    "members": result[groupIdx].dataValues.cnt
                  };
                  res.end(JSON.stringify(output, null, 2));
                });
              } else {
                output.group = {
                  "id":result[groupIdx].parent_id,
                  "members": result[groupIdx].dataValues.cnt
                };
                res.end(JSON.stringify(output, null, 2));
              }
            }
          });
        });
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
    res.setHeader('content-type', 'application/json');
    var whereClause;

    if (req.swagger.params.indicator_id) {
      whereClause = {
        include: [{
          model: models.score,
          attributes: [
            [models.sequelize.fn('MIN', models.sequelize.col('score')), 'minimum'],
            [models.sequelize.fn('MAX', models.sequelize.col('score')), 'maximum'],
            [models.sequelize.fn('AVG', models.sequelize.col('score')), 'average'],
            [models.sequelize.fn('COUNT', models.sequelize.col('score')), 'count']
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
    res.setHeader('content-type', 'application/json');
    var response = {};
    if (req.swagger.params.body.value.title) {
      models.indicator.findOrCreate({
        where: {
          title: req.swagger.params.body.value.title
        }
      }).spread(function(indicator, created) {
        var hist = {
          model: 'indicator',
          string_value: indicator.dataValues.title,
          operation: 'UPDATE',
          parent_id: indicator.dataValues.id,
          stamp: indicator.dataValues.updatedAt
        };
        if (created) {
          hist.operation = 'CREATE';
          hist.stamp = indicator.dataValues.createdAt;
        }
        models.history.create(hist);
        res.end(JSON.stringify(util.removeNulls(indicator), null, 2));
      });
    } else {
      return util.catchError(req, res, {
        "code": 400,
        "name": "fieldErrors",
        "message": "No title provided",
        "fields": ["title"]
      });
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
    res.setHeader('content-type', 'application/json');
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
    res.setHeader('content-type', 'application/json');
    models.indicator.findAll({
      attributes: [
        'id', 'title', 'createdAt', 'updatedAt', [models.sequelize.fn('MIN', models.sequelize.col('scores.score')), 'minimum'],
        [models.sequelize.fn('MAX', models.sequelize.col('scores.score')), 'maximum'],
        [models.sequelize.fn('AVG', models.sequelize.col('scores.score')), 'average'],
        [models.sequelize.fn('COUNT', models.sequelize.col('scores.score')), 'count']
      ],
      include: [{
        model: models.score,
        attributes: []
      }],
      group: ['indicator.id']
    }).then(function(indicators) {
      if (Object.keys(indicators).length > 0) {

        res.end(JSON.stringify(util.removeNulls(indicators) || [], null, 2));
      } else {
        res.end(JSON.stringify([], null, 2));
      }
    });
  };

  /**
   * GET Array of Indicator
   *
   * @api {get} /api/indicators
   **/
  module.exports.history_GET = function(req, res, next) {
    res.setHeader('content-type', 'application/json');
    models.history.findAll({
      where: {
        identity_id: req.swagger.params.identity_id.value
      }
    }).then(function(results) {
      if (Object.keys(results).length > 0) {
        var history = {
          identity_id: null,
          scores: [],
          indicators: []
        };
        for (var i in results) {
          if (results[i].dataValues.model === "score") {
            history.scores.push({
              indicator_id: results[i].dataValues.parent_id,
              score: results[i].dataValues.integer_value,
              operation: results[i].dataValues.operation,
              timestamp: results[i].dataValues.stamp
            });
          } else if (results[i].dataValues.model === 'indicator') {
            history.indicators.push({
              id: results[i].dataValues.parent_id,
              title: results[i].dataValues.string_value,
              operation: results[i].dataValues.operation,
              timestamp: results[i].dataValues.stamp
            });
          }
        }
        res.end(JSON.stringify(util.removeNulls(history) || [], null, 2));
      } else {
        res.end(JSON.stringify([], null, 2));
      }
    });
  };

  module.exports.history_indicator_GET = function(req, res, next) {
    res.setHeader('content-type', 'application/json');
    models.history.findAll({
      where: {
        identity_id: req.swagger.params.identity_id.value,
        model: 'score',
        parent_id: req.swagger.params.indicator_id.value
      }
    }).then(function(results) {
      if (Object.keys(results).length > 0) {
        var history = {
          identity_id: req.swagger.params.identity_id.value,
          indicator_id: req.swagger.params.indicator_id.value,
          scores: []
        };
        for (var i in results) {
          history.scores.push({
            score: results[i].dataValues.integer_value,
            operation: results[i].dataValues.operation,
            timestamp: results[i].dataValues.stamp
          });
        }
        res.end(JSON.stringify(util.removeNulls(history) || [], null, 2));
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
    res.setHeader('content-type', 'application/json');
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
            [models.sequelize.fn('COUNT', models.sequelize.col('score')), 'count']
          ]
        };
        models.score.findOne({
          where: where
        }).then(function(foundItem) {
          if (!foundItem) {
            // Item not found, create a new one
            models.score.create(tScore)
              .then(function(result) {
                models.history.create({
                  model: 'score',
                  integer_value: result.dataValues.score,
                  operation: 'CREATE',
                  parent_id: result.dataValues.indicator_id,
                  identity_id: result.dataValues.identity_id,
                  stamp: result.dataValues.createdAt
                });
                models.score.findAll(resultQuery).then(function(result) {
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
                // Write Update to History
                models.history.create({
                  model: 'score',
                  integer_value: tScore.score,
                  operation: 'UPDATE',
                  parent_id: tScore.indicator_id,
                  identity_id: tScore.identity_id,
                  stamp: new Date()
                });
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
    res.setHeader('content-type', 'application/json');
    var examples = {};
    examples['application/json'] = [{
      "description": "vote description",
      "title": " vote title"
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
    res.setHeader('content-type', 'application/json');
    var examples = {};
    examples['application/json'] = [{
      "description": "merge description",
      "title": "merge title"
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
    res.setHeader('content-type', 'application/json');
    var examples = {};
    examples['application/json'] = [{
      "description": "merge post description",
      "title": "merge post title"
    }];
    if (Object.keys(examples).length > 0) {
      res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
      res.end();
    }
  };
  /**
   * POST a new Indicator
   *
   * @api {post} /api/indicator
   * @param body
   * @example { "title": "The Title of the Indicator"}
   **/
  module.exports.feedback_POST = function(req, res, next) {
    res.setHeader('content-type', 'application/json');
    var response = {};
    if (req.swagger.params.body.value.title) {
      models.feedback.findOrCreate({
        where: {
          id: req.swagger.params.body.value.id,
          title: req.swagger.params.body.value.title,
          description: req.swagger.params.body.value.description,
          session_id: req.swagger.params.body.value.session_id
        }
      }).spread(function(hit, created) {
        var mFeedback = {
          title: hit.dataValues.title,
          description: hit.dataValues.description,
          id: hit.dataValues.id,
          session_id: hit.dataValues.session_id
        };
        res.end(JSON.stringify(util.removeNulls(mFeedback), null, 2));
      });
    } else {
      return util.catchError(req, res, {
        "code": 400,
        "name": "fieldErrors",
        "message": "No title provided",
        "fields": ["title"]
      });
    }
  };

  /**
   * GET Array of Feedback
   *
   * @api {get} /api/feedback
   **/
  module.exports.feedback_GET = function(req, res, next) {
    res.setHeader('content-type', 'application/json');
    models.feedback.findAll({
      attributes: ['title', 'description']
    }).then(function(feedback) {
      if (Object.keys(feedback).length > 0) {
        res.end(JSON.stringify(util.removeNulls(feedback) || [], null, 2));
      } else {
        res.end(JSON.stringify([], null, 2));
      }
    });
  };
  /**
   * POST a new Indicator
   *
   * @api {post} /api/event
   * @param body
   **/
  module.exports.event_POST = function(req, res, next) {
    res.setHeader('content-type', 'application/json');
    var response = {};
    if (req.swagger.params.body.value.session_id &&
      req.swagger.params.body.value.event &&
      req.swagger.params.body.value.event.group_id) {
      //Find other members in the group
      models.member.findAll({
        where: {
          parent_id: req.swagger.params.body.value.event.group_id
        }
      }).then(function(group) {
        var identities = [];
        for (var i in group) {
          identities.push(group[i].identity_id);
        }
        models.session.find({
          where: {
            session_id: req.swagger.params.body.value.session_id
          }
        }).then(function(identity) {
          if (identity) {
            if (identities.indexOf(identity.identity_id) > -1) {
              //In the array, create the event
              models.event.create(req.swagger.params.body.value.event).then(function(event){
                var attendees = [];
                for (var i in identities) {
                  if(identities[i] === identity.identity_id){
                    attendees.push({ "event_id": event.id, "identity_id":identity.identity_id, "status": "CREATOR"});
                  } else {
                    attendees.push({ "event_id": event.id, "identity_id":identities[i], "status": "SENT"});
                  }
                }
                models.attendee.bulkCreate(attendees).then(function(){
                  res.end(JSON.stringify(util.removeNulls(event), null, 2));
                });
              });
            } else {
              return util.catchError(req, res, {
                "code": 400,
                "name": "authErrors",
                "message": "You are not allowed to post an event in this group"
              });
            }
          } else {
            return util.catchError(req, res, {
              "code": 400,
              "name": "authErrors",
              "message": "Your identity could not be validated"
            });
          }
        });

      });
    } else {
      var fields = [];
      if (!req.swagger.params.body.value.session_id) {
        fields.push('session_id');
      }
      if (!req.swagger.params.body.value.event) {
        fields.push('Event object');
      } else if (!req.swagger.params.body.value.event.group_id) {
        fields.push('group_id');
      }
      return util.catchError(req, res, {
        "code": 400,
        "name": "fieldErrors",
        "message": "Missing fields or objects",
        "fields": fields
      });
    }
  };
  /**
   * Attend event
   *
   * @api {post} /api/event
   * @param body
   **/
  module.exports.event_id_POST = function(req, res, next) {
    res.setHeader('content-type', 'application/json');
    var response = {};
    models.session.find({
      where: {
        session_id: req.swagger.params.body.value.session_id
      }
    }).then(function(identity) {
      if (identity) {
        var whereclause = {
          event_id: req.swagger.params.event_id.value,
          identity_id: identity.identity_id
        };
        //update record where identity and event_id are a match
        models.attendee.update(
          {status: 'ATTENDING'},
          {where: whereclause})
        .then(function (result) {
          if (result[0] === 0){
            return util.catchError(req, res, {
              "code": 400,
              "name": "notAttending",
              "message": "You are not allowed to attend this event"
            });
          } else {
            res.end(JSON.stringify(util.removeNulls({"status": "DECLINED"}), null, 2));
          }
        });
      }
    });
  };
  /**
   * Decline event
   *
   * @api {delete} /api/event
   * @param body
   **/
  module.exports.event_id_DELETE = function(req, res, next) {
    res.setHeader('content-type', 'application/json');
    var response = {};
    models.session.find({
      where: {
        session_id: req.swagger.params.body.value.session_id
      }
    }).then(function(identity) {
      if (identity) {
        var whereclause = {
          event_id: req.swagger.params.event_id.value,
          identity_id: identity.identity_id
        };
        //update record where identity and event_id are a match
        models.attendee.update(
          {status: 'DECLINED'},
          {where: whereclause})
        .then(function (result) {
          if (result[0] === 0){
            return util.catchError(req, res, {
              "code": 400,
              "name": "notAttending",
              "message": "You cannot decline this event"
            });
          } else {
            res.end(JSON.stringify(util.removeNulls({"status": "DECLINED"}), null, 2));
          }
        });
      }
    });
  };
}());
