//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var moment = require('moment-timezone');
var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../server');
chai.use(chaiHttp);
var should = chai.should();

describe('testing sentimeter api', function() {
  var identities = [];
  var sessions = [];
  var event_id;
  var indicator_id;
  var group_id;
  afterEach(function() {
    // runs after each test in this block
  });
  /*
   * Test the /GET docs route
   */
  describe('/GET docs', function() {
    it('it should GET default swaggger docs', function(done) {
      chai.request(app)
        .get('/docs')
        .end(function(err, res) {
          res.should.be.html; // jshint ignore:line
          res.should.have.status(200);
          done();
        });
    });
  });

  /*
   * Test the /Post handshake
   */
  describe('/POST handshake, first user', function() {
    it('it should return identity, group and session', function(done) {
      chai.request(app)
        .post('/api/handshake')
        .send({})
        .end(function(err, res) {
          var data = JSON.parse(res.text);
          should.exist(data.identity_id);
          should.exist(data.session_id);
          should.exist(data.group);
          identities.push(data.identity_id);
          group_id = data.group.id;
          res.should.be.json; // jshint ignore:line
          res.should.have.status(200);
          done();
        });
    });
  });

  /*
   * Test the /Post handshake
   */
  describe('/POST handshake, new session, same group', function() {
    it('it should return identity, group and NEW session', function(done) {
      chai.request(app)
        .post('/api/handshake')
        .send({"identity_id": identities[0]})
        .end(function(err, res) {
          var data = JSON.parse(res.text);
          should.exist(data.identity_id);
          sessions.push(data.session_id);
          should.exist(data.session_id);
          should.exist(data.group);
          should.equal(data.group.id, group_id);
          res.should.be.json; // jshint ignore:line
          res.should.have.status(200);
          done();
        });
    });
  });

  /*
   * Test the /Post handshake
   */
  describe('/POST handshake, second user; new identity and session, same group', function() {
    it('it should return NEW identity, SAME group and NEW session', function(done) {
      chai.request(app)
        .post('/api/handshake')
        .send({})
        .end(function(err, res) {
          var data = JSON.parse(res.text);
          should.exist(data.identity_id);
          should.exist(data.session_id);
          should.exist(data.group);
          identities.push(data.identity_id);
          sessions.push(data.session_id);
          should.equal(data.group.id, group_id);
          res.should.be.json; // jshint ignore:line
          res.should.have.status(200);
          done();
        });
    });
  });

  /*
   * Test the /Post handshake
   */
  describe('/POST handshake, third user; new identity and session, same group', function() {
    it('it should return NEW identity, SAME group and NEW session', function(done) {
      chai.request(app)
        .post('/api/handshake')
        .send({})
        .end(function(err, res) {
          var data = JSON.parse(res.text);
          //console.log(res.text);
          should.exist(data.identity_id);
          should.exist(data.session_id);
          should.exist(data.group);
          identities.push(data.identity_id);
          sessions.push(data.session_id);
          should.equal(data.group.id, group_id);
          res.should.be.json; // jshint ignore:line
          res.should.have.status(200);
          done();
        });
    });
  });

  /*
   * Test the /Post handshake
   */
  describe('/POST handshake, fourth user; new identity and session, same group', function() {
    it('it should return NEW identity, SAME group and NEW session', function(done) {
      chai.request(app)
        .post('/api/handshake')
        .send({})
        .end(function(err, res) {
          var data = JSON.parse(res.text);
          //console.log(res.text);
          should.exist(data.identity_id);
          should.exist(data.session_id);
          should.exist(data.group);
          identities.push(data.identity_id);
          sessions.push(data.session_id);
          should.equal(data.group.id, group_id);
          res.should.be.json; // jshint ignore:line
          res.should.have.status(200);
          done();
        });
    });
  });

  /*
   * Test the /Post handshake
   */
  describe('/POST handshake, fifth user; new identity and session, new group', function() {
    it('it should return NEW identity,NEW group and NEW session', function(done) {
      chai.request(app)
        .post('/api/handshake')
        .send({})
        .end(function(err, res) {
          var data = JSON.parse(res.text);
          //console.log(res.text);
          should.exist(data.identity_id);
          should.exist(data.session_id);
          should.exist(data.group);
          identities.push(data.identity_id);
          sessions.push(data.session_id);
          should.not.equal(data.group.id, group_id);
          res.should.be.json; // jshint ignore:line
          res.should.have.status(200);
          done();
        });
    });
  });
  /*
   * Test the /GET indicators route
   */
  describe('/GET indicators', function() {
    it('it should return empty array of indicators', function(done) {
      chai.request(app)
        .get('/api/indicators')
        .end(function(err, res) {
          var data = JSON.parse(res.text);
          data.should.be.instanceof(Array);
          data.should.have.lengthOf(0);
          res.should.be.json; // jshint ignore:line
          res.should.have.status(200);
          done();
        });
    });
  });

  /*
   * Test the creation of an indicator
   */
   describe('/POST indicator', function() {
     it('it should return indicator', function(done) {
       chai.request(app)
         .post('/api/indicator')
         .send({
           "title": "This is an indicator title"
         })
         .end(function(err, res) {
           var data = JSON.parse(res.text);
           should.exist(data.id);
           indicator_id = data.id;
           res.should.be.json; // jshint ignore:line
           res.should.have.status(200);
           done();
         });
     });
   });

   /*
    * Test the creation of an indicator
    */
    describe('/POST score without fields', function() {
      it('it should return a error', function(done) {
        chai.request(app)
          .post('/api/score')
          .send({})
          .end(function(err, res) {
            var data = JSON.parse(res.text);
            res.should.be.json; // jshint ignore:line
            res.should.have.status(400);
            done();
          });
      });
    });
   /*
    * Test the creation of an indicator
    */
    describe('/POST score', function() {
      it('it should return a single score', function(done) {
        var data = {
          "session_id": sessions[0],
          "indicator_id": indicator_id,
          "score": 5
        };
        chai.request(app)
          .post('/api/score')
          .send(data)
          .end(function(err, res) {
            var data = JSON.parse(res.text);
            //console.log(res.text);
            should.equal(data[0].count, 1);
            res.should.be.json; // jshint ignore:line
            res.should.have.status(200);
            done();
          });
      });
    });
    /*
     * Test the creation of feedback
     */
     describe('/POST feedback, no fields', function() {
       it('it should return a error', function(done) {
         chai.request(app)
           .post('/api/feedback')
           .send({
             "session_id": sessions[0]
           })
           .end(function(err, res) {
             var data = JSON.parse(res.text);
             res.should.be.json; // jshint ignore:line
             res.should.have.status(400);
             done();
           });
       });
     });
    /*
     * Test the creation of feedback
     */
     describe('/POST feedback, title only', function() {
       it('it should return ok', function(done) {
         chai.request(app)
           .post('/api/feedback')
           .send({
             "session_id": sessions[0],
             "title": "This is a test feedback title"
           })
           .end(function(err, res) {
             var data = JSON.parse(res.text);
             res.should.be.json; // jshint ignore:line
             res.should.have.status(200);
             done();
           });
       });
     });

     /*
      * Test the creation of feedback
      */
      describe('/POST feedback, title and description', function() {
        it('it should return ok', function(done) {
          chai.request(app)
            .post('/api/feedback')
            .send({
              "session_id": sessions[0],
              "title": "This is another test feedback title",
              "description": "This is another test feedback description"
            })
            .end(function(err, res) {
              var data = JSON.parse(res.text);
              res.should.be.json; // jshint ignore:line
              res.should.have.status(200);
              done();
            });
        });
      });

    /*
     * Test the /GET indicators route
     */
    describe('/GET indicators', function() {
      it('it should return a single indicator', function(done) {
        chai.request(app)
          .get('/api/indicators')
          .end(function(err, res) {
            var data = JSON.parse(res.text);
            data.should.be.instanceof(Array);
            data.should.have.lengthOf(1);
            res.should.be.json; // jshint ignore:line
            res.should.have.status(200);
            done();
          });
      });
    });
    /*
     * Test the /GET feedback route
     */
    describe('/GET feedback', function() {
      it('it should return a list of feedback', function(done) {
        chai.request(app)
          .get('/api/feedback')
          .end(function(err, res) {
            var data = JSON.parse(res.text);
            data.should.be.instanceof(Array);
            data.should.have.lengthOf(2);
            res.should.be.json; // jshint ignore:line
            res.should.have.status(200);
            done();
          });
      });
    });
    /*
     * Test the creation of an event
     */
     describe('/POST event', function() {
       it('it should return ok', function(done) {
         var data = {
           "session_id": sessions[0],
           "event": {
             "group_id": group_id,
             "summary": "This is an event",
             "location": "Mainstreet 1027, New York",
             "start": moment().add(1, 'days').add(6,'h').tz(moment.tz.guess()),
             "end": moment().add(1, 'days').add(7,'h').tz(moment.tz.guess())
           }
         };
         chai.request(app)
           .post('/api/event')
           .send(data)
           .end(function(err, res) {
             var data = JSON.parse(res.text);
             event_id = data.id;
             res.should.be.json; // jshint ignore:line
             res.should.have.status(200);
             done();
           });
       });
     });
     /*
      * Test the creation of an event
      */
      describe('/POST event with id sets status to ATTENDING', function() {
        it('Status should be ATTENDING', function(done) {
          var data = {
            "session_id": sessions[1],
          };
          chai.request(app)
            .post('/api/event/' + event_id)
            .send(data)
            .end(function(err, res) {
              var data = JSON.parse(res.text);
              res.should.be.json; // jshint ignore:line
              res.should.have.status(200);
              done();
            });
        });
      });
     /*
      * Test the creation of an event
      */
      describe('/DELETE event', function() {
        it('Status should be DECLINED', function(done) {
          var data = {
            "session_id": sessions[2],
          };
          chai.request(app)
            .delete('/api/event/' + event_id)
            .send(data)
            .end(function(err, res) {
              var data = JSON.parse(res.text);
              res.should.be.json; // jshint ignore:line
              res.should.have.status(200);
              done();
            });
        });
      });
      /*
       * Test the creation of an event
       */
       describe('/DELETE event, no attendee', function() {
         it('Should fail (400)', function(done) {
           var data = {
             "session_id": sessions[4],
           };
           chai.request(app)
             .delete('/api/event/' + event_id)
             .send(data)
             .end(function(err, res) {
               res.should.be.json; // jshint ignore:line
               res.should.have.status(400);
               done();
             });
         });
       });
});
