/* eslint-disable */
const chaiHttp = require("chai-http");
const chai = require("chai");
const app = require("../app");
const moment = require("moment");
const { customAlphabet } = require("nanoid");
const randomToken = customAlphabet("QWERTYUPLKJHGFDAZXCVBNM23456789", 10);
chai.use(chaiHttp);
const { expect } = chai;
let userId;
let passwordResetToken;
let emailVerificationToken;
const { User, Token } = require("../models");
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
          expect(res.body.data.token).to.match(
            /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/g
          );
          done();
        });
    });
  });
  describe("EMAIL VERIFICATION TOKEN ROUTE", (done) => {
    it("sends an email verification to user", (done) => {
      chai
        .request(app)
        .get("/auth/request-verification?email=testuser2@mail.com")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body.data).to.be.null;
          expect(res.body).to.have.deep.property("message");
          expect(res.body.message).to.equal(
            "Verification mail sent successfully"
          );
          done();
        });
    });
    it("returns a 400 error if email is not sent", (done) => {
      chai
        .request(app)
        .get("/auth/request-verification")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body.data).to.be.null;
          expect(res.body).to.have.deep.property("message");
          expect(res.body.message).to.equal("Email required");
          done();
        });
    });
    it("returns a 401 error if user does not exist", (done) => {
      before((done) => {
        User.deleteOne({ email: "anonuser@mail.com" }, (err, user) => {
          done();
        });
      });
      chai
        .request(app)
        .get("/auth/request-verification?email=anonuser@mail.com")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body.data).to.be.null;
          expect(res.body).to.have.deep.property("message");
          expect(res.body.message).to.equal(
            "The email address anonuser@mail.com is not associated with any account. Double-check your email address and try again."
          );
          done();
        });
    });
    describe("USER ALREADY VERIFIED", () => {
      before((done) => {
        User.findOneAndUpdate(
          { email: "testuser2@mail.com" },
          { isVerified: true },
          (err, user) => {
            user.save((err, savedUser) => {
              done();
            });
          }
        );
      });
      it("returns a 400 error if user is already verified.", (done) => {
        chai
          .request(app)
          .get("/auth/request-verification?email=testuser2@mail.com")
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.haveOwnProperty("data");
            expect(res.body.data).to.be.null;
            expect(res.body).to.have.deep.property("message");
            expect(res.body.message).to.equal(
              "This account has already been verified. Please log in."
            );
            done();
          });
      });
    });
  });
  describe("EMAIL VERIFICATION ROUTE", (done) => {
    before((done) => {
      User.findOne({ email: "testuser2@mail.com" }, (err, user) => {
        userId = user._id;
        user.isVerified = false;
        user.save();
        Token.create(
          {
            token: randomToken(),
            expired: false,
            expiresIn: moment.utc().add(1, "hours"),
            type: "verify-email",
            user: userId,
          },
          (err, token) => {
            emailVerificationToken = token.token;
            done();
          }
        );
      });
    });
    it("verifies a user with a valid token", (done) => {
      chai
        .request(app)
        .get(`/auth/verify-email/${emailVerificationToken}`)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body.data).to.be.null;
          expect(res.body).to.have.deep.property("message");
          expect(res.body.message).to.equal("Account verified successfully.");
          done();
        });
    });
    it("returns a 400 error for an invalid token", (done) => {
      chai
        .request(app)
        .get(`/auth/verify-email/123245`)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body.data).to.be.null;
          expect(res.body).to.have.deep.property("message");
          expect(res.body.message).to.equal(
            "Your verification link may have expired. Please request a new one"
          );
          done();
        });
    });
    describe("EXPIRED VERIFICATION TOKEN", () => {
      before((done) => {
        Token.updateMany({ user: userId }, { expired: true }, (err, token) => {
          done();
        });
      });
      it("returns a 400 error if token is expired", (done) => {
        chai
          .request(app)
          .get(`/auth/verify-email/${emailVerificationToken}`)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.haveOwnProperty("data");
            expect(res.body.data).to.be.null;
            expect(res.body).to.have.deep.property("message");

            expect(res.body.message).to.equal(
              "Verification link expired. Please request a new one"
            );
            done();
          });
      });
    });
    describe("USER ALREADY VERIFIED", () => {
      before((done) => {
        User.updateOne({ _id: userId }, { isVerified: true }, (err, user) => {
          Token.create(
            {
              token: randomToken(),
              expired: false,
              expiresIn: moment.utc().add(1, "hours"),
              type: "verify-email",
              user: userId,
            },
            (err, token) => {
              emailVerificationToken = token.token;
              done();
            }
          );
        });
      });
      it("returns a 400 error if token is expired", (done) => {
        chai
          .request(app)
          .get(`/auth/verify-email/${emailVerificationToken}`)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            expect(res.body).to.haveOwnProperty("data");
            expect(res.body.data).to.be.null;
            expect(res.body).to.have.deep.property("message");

            expect(res.body.message).to.equal(
              "This user has already been verified."
            );
            done();
          });
      });
    });
  });
  describe("PASSWORD RESET TOKEN ROUTE", (done) => {
    it("sends password reset code to user", (done) => {
      chai
        .request(app)
        .get("/auth/recover-password?email=testuser2@mail.com")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body.data).to.be.null;
          expect(res.body).to.have.deep.property("message");
          expect(res.body.message).to.equal(
            "-A reset email has been sent to testuser2@mail.com"
          );
          done();
        });
    });
    it("returns a 400 error if email is not sent", (done) => {
      chai
        .request(app)
        .get("/auth/recover-password")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body.data).to.be.null;
          expect(res.body).to.have.deep.property("message");
          expect(res.body.message).to.equal("please send a valid email");
          done();
        });
    });
  });
  describe("PASSWORD RESET ROUTE", (done) => {
    before((done) => {
      User.findOne({ email: "testuser2@mail.com" }, (err, user) => {
        userId = user._id;
        user.isVerified = false;
        user.save();
        Token.create(
          {
            token: randomToken(),
            expired: false,
            expiresIn: moment.utc().add(1, "hours"),
            type: "password-reset",
            user: userId,
          },
          (err, token) => {
            passwordResetToken = token.token;
            done();
          }
        );
      });
    });
    it("returns an error if passowrd is omitted", (done) => {
      chai
        .request(app)
        .post(`/auth/reset-password/${passwordResetToken}`)
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body.data).to.haveOwnProperty("password");
          expect(res.body).to.have.deep.property("message");
          expect(res.body.message).to.equal("request validation failed");
          done();
        });
    });
    it("resets a user's password", (done) => {
      chai
        .request(app)
        .post(`/auth/reset-password/${passwordResetToken}`)
        .send({ password: "newpassword" })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body.data).to.be.null;
          expect(res.body).to.have.deep.property("message");
          expect(res.body.message).to.equal("");
          done();
        });
    });
  });
});
