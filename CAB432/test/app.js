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

describe('GET /result?keywords=test&limit=8000', () => {
  it('should return 200 OK', (done) => {
    request(app)
      .get('/result?keywords=test&limit=8000')
      .expect(200, done);
  });
});

describe('GET /result', () => {
  it('should return 500 when no params given', (done) => {
    request(app)
      .get('/result')
      .expect(500, done);
  });
});

describe('GET /random-url', () => {
  it('should return 404', (done) => {
    request(app)
      .get('/reset')
      .expect(404, done);
  });
});
