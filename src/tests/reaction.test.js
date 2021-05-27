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
let reactionId;
let dummyReactionId;
let dummyCommentId;
const { Comment, Post, Reaction } = require("../models");
const wrongPostId = ObjectId();
const wrongCommentId = ObjectId();
const wrongReactionId = ObjectId();
const dummyAuthorId = ObjectId();
const wrongMongoId = "qwertyuiop";

describe("POST REACTION ROUTES", () => {
  before((done) => {
    chai
      .request(app)
      .post("/auth/login")
      .send({
        email: "testuser@mail.com", //valid test login details
        password: "testPass",
      })
      .end((error, res) => {
        authToken = res.body.data.token;
        userId = res.body.data.user._id;
        Post.create({ text: "dummy post", author: userId }, (err, post) => {
          postId = post._id;
          Comment.create(
            { text: "another dummy post", post: post._id, author: userId },
            (err, dummyComment) => {
              dummyCommentId = dummyComment._id;
              Reaction.create(
                {
                  type: "like",
                  referenceType: "Post",
                  reference: post._id,
                  author: userId,
                },
                (err, reaction) => {
                  reactionId = reaction._id;
                  Reaction.create(
                    {
                      type: "love",
                      referenceType: "Comment",
                      reference: dummyComment._id,
                      author: dummyAuthorId,
                    },
                    (err, dummyReaction) => {
                      dummyReactionId = dummyReaction._id;
                      done();
                    }
                  );
                }
              );
            }
          );
        });
      });
  });
  describe("CREATE REACTION", () => {
    it("it creates a new comment to an existing post", (done) => {
      chai
        .request(app)
        .post("/reactions")
        .set({ Authorization: `Bearer ${authToken}` })
        .send({
          type: "love",
          referenceType: "Post",
          referenceId: postId,
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.deep.property("_id");
          expect(res.body.data).to.have.deep.property("author");
          expect(res.body.data.author).to.equal(userId);
          done();
        });
    });
    it("it returns a 400 error if reaction type is empty", (done) => {
      chai
        .request(app)
        .post("/reactions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          referenceType: "Post",
          referenceId: postId,
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("request validation failed");
          done();
        });
    });
    it("it returns a 400 error if reaction type is not valid", (done) => {
      chai
        .request(app)
        .post("/reactions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "wrongType",
          referenceType: "Post",
          referenceId: postId,
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("request validation failed");
          done();
        });
    });
    it("it returns a 400 error if reference ID field is empty", (done) => {
      chai
        .request(app)
        .post("/reactions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "love",
          referenceType: "Post",
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.have.property("referenceId");
          expect(res.body.message).to.equal("request validation failed");
          done();
        });
    });
    it("it returns a 400 error if referenceId is a wrong mongo id", (done) => {
      chai
        .request(app)
        .post("/reactions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "love",
          referenceType: "Post",
          referenceId: wrongMongoId,
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.have.property("referenceId");
          expect(res.body.message).to.equal("request validation failed");
          done();
        });
    });
    it("it returns a 400 error if referenceType field is empty", (done) => {
      chai
        .request(app)
        .post("/reactions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "love",
          referenceId: postId,
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.have.property("referenceType");
          expect(res.body.message).to.equal("request validation failed");
          done();
        });
    });
    it("it returns a 400 error if referenceType is incorrect", (done) => {
      chai
        .request(app)
        .post("/reactions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "love",
          referenceId: postId,
          referenceType: "invalidType",
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.have.property("referenceType");
          expect(res.body.message).to.equal("request validation failed");
          done();
        });
    });
    it("it returns a 404 error if reference is not found", (done) => {
      chai
        .request(app)
        .post("/reactions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "love",
          referenceId: wrongPostId,
          referenceType: "Post",
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.be.null;
          expect(res.body.message).to.equal("reference not found");
          done();
        });
    });
    it("it sends a 401 error if authorization token is absent or incorrect", (done) => {
      chai
        .request(app)
        .post("/reactions")
        .send({
          type: "love",
          referenceId: postId,
          referenceType: "Post",
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(401);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.be.a("null");
          done();
        });
    });
  });
  describe("FETCH REACTIONS", () => {
    it("it fetches reactions", (done) => {
      chai
        .request(app)
        .get("/reactions")
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.an("object");
          expect(res.body.data).to.haveOwnProperty("data");
          expect(res.body.message).to.be.a("string");
          expect(res.body.data.data).to.be.a("array");
          expect(res.body.data.data).to.have.lengthOf.greaterThanOrEqual(0);
          done();
        });
    });
    it("it fetches reactions for a post or comment", (done) => {
      chai
        .request(app)
        .get(`/reactions?post=${postId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.an("object");
          expect(res.body.data).to.haveOwnProperty("data");
          expect(res.body.message).to.be.a("string");
          expect(res.body.data.data).to.be.a("array");
          expect(res.body.data.data).to.have.lengthOf.greaterThanOrEqual(0);
          done();
        });
    });
    it("it should return an empty array for a wrong referenceId", (done) => {
      chai
        .request(app)
        .get(`/reactions?post=${wrongPostId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.an("object");
          expect(res.body.data).to.haveOwnProperty("data");
          expect(res.body.message).to.be.a("string");
          expect(res.body.data.data).to.be.a("array");
          expect(res.body.data.data).to.have.length(0);
          done();
        });
    });
    it("it returns a 400 error if referenceId is a wrong mongo id", (done) => {
      chai
        .request(app)
        .get(`/reactions?reference=${wrongMongoId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.be.null;
          expect(res.body.message).to.match(/invalid parameter sent/g);
          done();
        });
    });
    it("it returns a 401 error if request is unauthenticated", (done) => {
      chai
        .request(app)
        .get("/reactions")
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(401);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.message).to.be.a("string");
          expect(res.body.data).to.be.a("null");
          done();
        });
    });
  });
  describe("FETCH REACTION", () => {
    it("it fetches a single reaction", (done) => {
      chai
        .request(app)
        .get(`/reactions/${reactionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.an("object");
          expect(res.body.message).to.be.a("string");
          expect(res.body.data).to.be.an("object");
          expect(res.body.data).to.haveOwnProperty("_id");
          expect(res.body.data).to.haveOwnProperty("type");
          expect(res.body.data).to.haveOwnProperty("author");
          done();
        });
    });
    it("it returns a 404 error if reaction is not found", (done) => {
      chai
        .request(app)
        .get(`/reactions/${wrongReactionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.be.a("string");
          expect(res.body.message).to.equal("reaction not found");
          done();
        });
    });
    it("it returns a 400 error if reactionId is an invalid object id", (done) => {
      chai
        .request(app)
        .get(`/reactions/${wrongMongoId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.be.a("string");
          done();
        });
    });
    it("it returns a 401 error if authorization is absent or incorrect", (done) => {
      chai
        .request(app)
        .get(`/reactions/${dummyReactionId}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(401);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.be.a("string");
          done();
        });
    });
  });
  describe("UPDATE REACTION", () => {
    it("it updates an existing reaction", (done) => {
      chai
        .request(app)
        .put(`/reactions/${reactionId}`)
        .set({ Authorization: `Bearer ${authToken}` })
        .send({ type: "like" })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.deep.property("_id");
          expect(res.body.data).to.have.deep.property("type");
          expect(res.body.data.type).to.equal("like");
          done();
        });
    });
    it("it returns a 403 error if user is not author", (done) => {
      chai
        .request(app)
        .put(`/reactions/${dummyReactionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          text: "this is an update to a comment",
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(403);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.be.a("string");
          expect(res.body.message).to.equal(
            "You are not authorized to perform this action"
          );
          done();
        });
    });
    it("it returns a 404 error if comment is not found", (done) => {
      chai
        .request(app)
        .put(`/reactions/${wrongReactionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "haha",
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.be.a("string");
          expect(res.body.message).to.equal("reaction not found");
          done();
        });
    });
    it("it returns a 400 error if post id is an invalid object id", (done) => {
      chai
        .request(app)
        .put(`/reactions/${wrongMongoId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "haha",
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.be.a("string");
          done();
        });
    });
    it("it sends a 401 error if authorization token is absent or incorrect", (done) => {
      chai
        .request(app)
        .put(`/reactions/${reactionId}`)
        .send({
          type: "haha",
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(401);
          done();
        });
    });
  });
  describe("DELETE REACTION", () => {
    it("it deletes an existing reaction", (done) => {
      chai
        .request(app)
        .delete(`/reactions/${reactionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.be.a("string");
          done();
        });
    });
    it("it returns a 404 error if reaction is not found", (done) => {
      chai
        .request(app)
        .delete(`/reactions/${wrongReactionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.be.a("string");
          expect(res.body.message).to.equal("reaction not found");
          done();
        });
    });
    it("it returns a 400 error if reaction id is an invalid object id", (done) => {
      chai
        .request(app)
        .delete(`/reactions/${wrongMongoId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.be.a("string");
          done();
        });
    });
    it("it returns a 403 error if user is not author", (done) => {
      chai
        .request(app)
        .delete(`/reactions/${dummyReactionId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(403);
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.be.a("string");
          expect(res.body.message).to.equal(
            "You are not authorized to perform this action"
          );
          done();
        });
    });
    it("it returns a 401 error if authorization is absent or incorrect", (done) => {
      chai
        .request(app)
        .delete(`/reactions/${reactionId}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(401);
          expect(res.body).to.be.an("object");
          expect(res.body).to.haveOwnProperty("data");
          expect(res.body).to.haveOwnProperty("message");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.be.a("string");
          done();
        });
    });
  });
});
