//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../server');
chai.use(chaiHttp);
var should = chai.should();

describe('testing sentimeter api', function() {
  var session_id;
  var indicator_id;
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
          res.should.have.status(200);
          done();
        });
    });
  });

  /*
   * Test the /Post handshake
   */
  describe('/POST handshake', function() {
    it('it should return identity and session', function(done) {
      chai.request(app)
        .post('/api/handshake')
        .send({})
        .end(function(err, res) {
          var data = JSON.parse(res.text);
          should.exist(data.identity_id);
          should.exist(data.session_id);
          session_id = data.session_id;
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
           "title": "Waarin ik mij gelukkig voel"
         })
         .end(function(err, res) {
           var data = JSON.parse(res.text);
           should.exist(data.id);
           indicator_id = data.id;
           res.should.have.status(200);
           done();
         });
     });
   });

   /*
    * Test the creation of an indicator
    */
    describe('/POST score', function() {
      it('it should return a single score', function(done) {
        chai.request(app)
          .post('/api/score')
          .send({
            "session_id": session_id,
            "indicator_id": indicator_id,
            "score": 5
          })
          .end(function(err, res) {
            var data = JSON.parse(res.text);
            should.equal(data[0].count, 1);
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
            res.should.have.status(200);
            done();
          });
      });
    });
});
