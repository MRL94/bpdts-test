/* eslint-disable no-undef */
const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it } = require('mocha');
const sinon = require('sinon');
const nock = require('nock');
const app = require('../../app');
const { userList, londonUsers } = require('../mockData/userList.json');
const { userServiceError } = require('../../responses/errors');

const { assert, expect } = chai;
chai.use(chaiHttp);

describe('userHandler.js', () => {
  describe('GET London users', () => {
    it('should return a 200 response with a list of users based within 50 miles of London', (done) => {
      nock('https://bpdts-test-app.herokuapp.com').get('/users').once().reply(200, userList);
      nock('https://bpdts-test-app.herokuapp.com').get('/city/London/users').reply(200, londonUsers);
      chai.request(app)
        .get('/users')
        .end((err, res) => {
          assert.deepEqual(res.statusCode, 200);
          expect(res.body).to.be.an('array');
          done();
        });
    });

    it.only('should not try to concat both arrays if no users are listed as living in London', (done) => {
      nock('https://bpdts-test-app.herokuapp.com').get('/users').once().reply(200, userList);
      nock('https://bpdts-test-app.herokuapp.com').get('/city/London/users').reply(200, []);
      chai.request(app)
        .get('/users')
        .end((err, res) => {
          const spy = sinon.spy(Array.concat);
          assert(spy.notCalled);
          assert.deepEqual(res.statusCode, 200);
          expect(res.body).to.be.an('array');
          done();
        });
    });


    it('should return a 500 response if an error occurs whilst retrieving users', (done) => {
      chai.request(app)
        .get('/users')
        .end((err, res) => {
          assert.deepEqual(res.statusCode, 500);
          assert.deepEqual(JSON.parse(res.error.text), userServiceError);
          done();
        });
    });

    it('should return a 500 response if an error occurs whilst retreiving London users', (done) => {
      nock('https://bpdts-test-app.herokuapp.com').get('/users').reply(200, userList);
      chai.request(app)
        .get('/users')
        .end((err, res) => {
          assert.deepEqual(res.statusCode, 500);
          assert.deepEqual(JSON.parse(res.error.text), userServiceError);
          done();
        });
    });
  });
});
