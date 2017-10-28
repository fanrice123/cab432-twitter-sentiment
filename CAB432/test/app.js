const request = require('supertest');
const app = require('../app.js');

describe('GET /', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/')
      .expect(200, done);
  });
});

describe('GET /home', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/home')
      .expect(200, done);
  });
});

describe('GET /result/name', () => {
  it('should return 302 redirect when no details given', (done) => {
    request(app)
      .get('/result/name')
      .expect(302, done);
  });
});

describe('GET /result/birthday', () => {
  it('should return 302 redirect when no details given', (done) => {
    request(app)
      .get('/result/birthday')
      .expect(302, done);
  });
});

describe('GET /random-url', () => {
  it('should return 404', (done) => {
    request(app)
      .get('/reset')
      .expect(404, done);
  });
});
