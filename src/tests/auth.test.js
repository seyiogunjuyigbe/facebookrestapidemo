/* eslint-disable */
const chaiHttp = require("chai-http");
const chai = require("chai");
const app = require("../app");
const { ObjectId } = require("mongodb");
chai.use(chaiHttp);
const { expect } = chai;
let authToken;
let postId;
let userId;
let commentId;
let dummyCommentId;
const { User } = require("../models");
describe("AUTH ROUTES", () => {
  describe("REGISTRATION ROUTE", () => {
    before((done) => {
      User.deleteOne({ email: "testuser2@mail.com" }, (err, deletedUser) => {
        done();
      });
    });
    it("registers new user", (done) => {
      chai
        .request(app)
        .post("/auth/register")
        .send({
          firstName: "Test",
          lastName: "User2",
          email: "testuser2@mail.com",
          password: "securePass",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body.data).to.have.deep.property("newUser");
          expect(res.body.data).to.have.deep.property("token");
          expect(res.body.data.newUser).to.have.deep.property("_id");
          expect(res.body.data.newUser).to.have.deep.property("email");
          expect(res.body.data.newUser).to.have.deep.property("firstName");
          expect(res.body.data.newUser).to.have.deep.property("lastName");
          expect(res.body.data.newUser).to.have.deep.property("isVerified");
          expect(res.body.data.newUser.isVerified).to.be.false;
          expect(res.body.data.newUser.email).to.equal("testuser2@mail.com");
          expect(res.body.data.token).to.be.a("string");
          done();
        });
    });
    it("returns a 409 error if user with email already exists", (done) => {
      chai
        .request(app)
        .post("/auth/register")
        .send({
          firstName: "Test",
          lastName: "User2",
          email: "testuser2@mail.com",
          password: "securePass",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(409);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body.data).to.be.null;
          expect(res.body.message).to.match(
            /An account with this email already exists/g
          );
          done();
        });
    });
    it("returns a 400 error if email is omitted", (done) => {
      chai
        .request(app)
        .post("/auth/register")
        .send({
          firstName: "Test",
          lastName: "User2",
          password: "securePass",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body).to.have.deep.property("data");
          expect(res.body.message).to.match(/request validation failed/g);
          expect(res.body.data).to.haveOwnProperty("email");
          done();
        });
    });
    it("returns a 400 error if password is omitted", (done) => {
      chai
        .request(app)
        .post("/auth/register")
        .send({
          firstName: "Test",
          lastName: "User2",
          email: "testuser2@mail.com",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body).to.have.deep.property("data");
          expect(res.body.message).to.match(/request validation failed/g);
          expect(res.body.data).to.haveOwnProperty("password");
          done();
        });
    });
    it("returns a 400 error if firstName is omitted", (done) => {
      chai
        .request(app)
        .post("/auth/register")
        .send({
          lastName: "User2",
          email: "testuser2@mail.com",
          password: "securePass",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body).to.have.deep.property("data");
          expect(res.body.message).to.match(/request validation failed/g);
          expect(res.body.data).to.haveOwnProperty("firstName");
          done();
        });
    });
    it("returns a 400 error if lastName is omitted", (done) => {
      chai
        .request(app)
        .post("/auth/register")
        .send({
          firstName: "Test",
          email: "testuser2@mail.com",
          password: "securePass",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body).to.have.deep.property("data");
          expect(res.body.message).to.match(/request validation failed/g);
          expect(res.body.data).to.haveOwnProperty("lastName");
          done();
        });
    });
  });
  describe("LOGIN ROUTE", (done) => {
    it("authenticates an existing user with correct email and password combination", (done) => {
      chai
        .request(app)
        .post("/auth/login")
        .send({
          email: "testuser2@mail.com",
          password: "securePass",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body.data).to.have.deep.property("user");
          expect(res.body.data).to.have.deep.property("token");
          expect(res.body.data.user).to.have.deep.property("_id");
          expect(res.body.data.user).to.have.deep.property("email");
          expect(res.body.data.user).to.have.deep.property("firstName");
          expect(res.body.data.user).to.have.deep.property("lastName");
          expect(res.body.data.user).to.have.deep.property("isVerified");
          expect(res.body.data.user.email).to.equal("testuser2@mail.com");
          expect(res.body.data.token).to.be.a("string");
          done();
        });
    });
    it("returns a 401 error if email is incorrect", (done) => {
      chai
        .request(app)
        .post("/auth/login")
        .send({
          email: "incorrectemail@mail.com",
          password: "securePass",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body.data).to.be.null;
          expect(res.body.message).to.match(/invalid email/i);
          done();
        });
    });
    it("returns a 401 error if password is incorrect", (done) => {
      chai
        .request(app)
        .post("/auth/login")
        .send({
          email: "testuser2@mail.com",
          password: "incorrectPass",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body.data).to.be.null;
          expect(res.body.message).to.match(/invalid email or password/i);
          done();
        });
    });
    it("returns a 400 error if email is omitted", (done) => {
      chai
        .request(app)
        .post("/auth/login")
        .send({
          password: "securePass",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body).to.have.deep.property("data");
          expect(res.body.message).to.match(/request validation failed/g);
          expect(res.body.data).to.haveOwnProperty("email");
          done();
        });
    });
    it("returns a 400 error if password is omitted", (done) => {
      chai
        .request(app)
        .post("/auth/login")
        .send({
          email: "testuser2@mail.com",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body).to.have.deep.property("data");
          expect(res.body.message).to.match(/request validation failed/g);
          expect(res.body.data).to.haveOwnProperty("password");
          done();
        });
    });
    it("sends a jwt token if login is successful", (done) => {
      chai
        .request(app)
        .post("/auth/login")
        .send({
          email: "testuser2@mail.com",
          password: "securePass",
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.have.deep.property("message");
          expect(res.body.data).to.have.deep.property("user");
          expect(res.body.data).to.have.deep.property("token");
          expect(res.body.data.token).to.be.a("string");
          done();
        });
    });
  });
  describe("EMAIL VERIFICATION TOKEN ROUTE", (done) => {});
  describe("EMAIL VERIFICATION ROUTE", (done) => {});
  describe("PASSWORD RESET TOKEN ROUTE", (done) => {});
  describe("PASSWORD RESET ROUTE", (done) => {});
  describe("PASSWORD CHANGE ROUTE", (done) => {});
});
