/* eslint-disable */
const chaiHttp = require("chai-http");
const chai = require("chai");
const app = require("../app");
const fs = require("fs");
const { ObjectId } = require("mongodb");
chai.use(chaiHttp);
const { expect } = chai;
let authToken;
let postId;
let userId;
let commentId;
let dummyCommentId;
const { Comment, Post } = require("../models");
const wrongPostId = ObjectId();
const wrongCommentId = ObjectId();
const dummyAuthorId = ObjectId();
const wrongMongoId = "qwertyuiop";

describe("COMMENTS", () => {
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
            { text: "another dummy post", author: dummyAuthorId },
            (err, dummyComment) => {
              dummyCommentId = dummyComment._id;
              Comment.create(
                { text: "an author comment", author: userId },
                (err, comment) => {
                  commentId = comment._id;
                  done();
                }
              );
            }
          );
        });
      });
  });
  describe("CREATE COMMENT", () => {
    it("it creates a new comment to an existing post", (done) => {
      chai
        .request(app)
        .post("/comments")
        .set({ Authorization: `Bearer ${authToken}` })
        .send({
          text: "this is a comment to a random facebook post",
          postId,
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.deep.property("_id");
          expect(res.body.data).to.have.deep.property("text");
          expect(res.body.data).to.have.deep.property("author");
          expect(res.body.data.text).to.equal(
            "this is a comment to a random facebook post"
          );
          expect(res.body.data.author).to.equal(userId);
          done();
        });
    });
    it("it returns a 400 error if comment body is empty", (done) => {
      chai
        .request(app)
        .post("/comments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          postId,
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.have.property("text");
          expect(res.body.message).to.equal("request validation failed");
          done();
        });
    });
    it("it returns a 400 error if postId field is empty", (done) => {
      chai
        .request(app)
        .post("/comments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          text: "this is a comment to a random facebook post",
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.have.property("postId");
          expect(res.body.message).to.equal("request validation failed");
          done();
        });
    });
    it("it returns a 400 error if postId is a wrong mongo id", (done) => {
      chai
        .request(app)
        .post("/comments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          text: "this is a comment to a random facebook post",
          postId: wrongMongoId,
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.have.property("postId");
          expect(res.body.message).to.equal("request validation failed");
          done();
        });
    });
    it("it returns a 404 error if post is not found", (done) => {
      chai
        .request(app)
        .post("/comments")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          text: "this is a comment to a random facebook post",
          postId: wrongPostId,
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.be.null;
          expect(res.body.message).to.equal("post not found");
          done();
        });
    });
    it("it sends a 401 error if authorization token is absent or incorrect", (done) => {
      chai
        .request(app)
        .post("/comments")
        .send({
          text: "this is a comment to a random facebook post",
          postId: wrongPostId,
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
  describe("FETCH COMMENTS", () => {
    it("it fetches comments", (done) => {
      chai
        .request(app)
        .get("/comments")
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
    it("it fetches comments for a post", (done) => {
      chai
        .request(app)
        .get(`/comments?post=${postId}`)
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
    it("it should return an empty array for a wrong postId", (done) => {
      chai
        .request(app)
        .get(`/comments?post=${wrongPostId}`)
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
    it("it returns a 400 error if postId is a wrong mongo id", (done) => {
      chai
        .request(app)
        .get(`/comments?post=${wrongMongoId}`)
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
        .get("/comments")
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
  describe("FETCH COMMENT", () => {
    it("it fetches a single comment", (done) => {
      chai
        .request(app)
        .get(`/comments/${dummyCommentId}`)
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
          expect(res.body.data).to.haveOwnProperty("text");
          done();
        });
    });
    it("it returns a 404 error if comment is not found", (done) => {
      chai
        .request(app)
        .get(`/comments/${wrongCommentId}`)
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
          expect(res.body.message).to.equal("comment not found");
          done();
        });
    });
    it("it returns a 400 error if comment id is an invalid object id", (done) => {
      chai
        .request(app)
        .get(`/comments/${wrongMongoId}`)
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
        .get(`/comments/${dummyCommentId}`)
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
  describe("UPDATE COMMENT", () => {
    it("it updates an existing comment", (done) => {
      chai
        .request(app)
        .put(`comments/${commentId}`)
        .set({ Authorization: `Bearer ${authToken}` })
        .send({ text: "this is an update to a random facebok comment" })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.deep.property("_id");
          expect(res.body.data).to.have.deep.property("text");
          expect(res.body.data.text).to.equal(
            "this is an update to a random facebok comment"
          );
          done();
        });
    });
    it("it returns a 403 error if user is not author", (done) => {
      chai
        .request(app)
        .put(`comments/${dummyCommentId}`)
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
        .put(`/comments/${wrongCommentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          text: "this is an update to a comment",
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
          expect(res.body.message).to.equal("comment not found");
          done();
        });
    });
    it("it returns a 400 error if post id is an invalid object id", (done) => {
      chai
        .request(app)
        .put(`/comments/${wrongMongoId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          text: "this is an update to a comment",
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
        .put(`/comments/${commentId}`)
        .send({
          text: "this is an update to a comment",
        })
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(401);
          done();
        });
    });
  });
  describe("DELETE COMMENT", () => {
    it("it deletes an existing comment", (done) => {
      chai
        .request(app)
        .delete(`/comments/${commentId}`)
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
    it("it returns a 404 error if comment is not found", (done) => {
      chai
        .request(app)
        .delete(`/comments/${wrongCommentId}`)
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
          expect(res.body.message).to.equal("comment not found");
          done();
        });
    });
    it("it returns a 400 error if comment id is an invalid object id", (done) => {
      chai
        .request(app)
        .delete(`/comments/${wrongMongoId}`)
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
        .delete(`comment/${dummyCommentId}`)
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
        .delete(`/comments/${commentId}`)
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
