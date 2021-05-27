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
let dummyPostId;
const { Post } = require("../models");
const wrongPostId = ObjectId();
const dummyAuthorId = ObjectId();
const wrongMongoId = "qwertyuiop";

describe("POSTS", () => {
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
          Post.create(
            { text: "another dummy post", author: dummyAuthorId },
            (err, dummyPost) => {
              dummyPostId = dummyPost._id;
              done();
            }
          );
        });
      });
  });
  describe("CREATE POST", () => {
    it("it creates a new post with text only", (done) => {
      chai
        .request(app)
        .post("/posts")
        .set({ Authorization: `Bearer ${authToken}` })
        .set("content-type", "multipart/form-data")
        .field(
          "text",
          "this is a random facebok post. please like, share and make comments"
        )
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.deep.property("_id");
          expect(res.body.data).to.have.deep.property("media");
          expect(res.body.data).to.have.deep.property("text");
          expect(res.body.data).to.have.deep.property("type");
          expect(res.body.data.type).to.contain.oneOf(["text", "media"]);
          expect(res.body.data.text).to.equal(
            "this is a random facebok post. please like, share and make comments"
          );
          expect(res.body.data.author).to.equal(userId);
          done();
        });
    });
    it("it creates a new post with text and image only", (done) => {
      chai
        .request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .set("content-type", "multipart/form-data")
        .field(
          "text",
          "this is a random facebok post. please like, share and make comments"
        )
        .attach(
          "media",
          fs.readFileSync(`${__dirname}/files/image1.jpg`),
          "files/image1.jpg"
        )
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.deep.property("_id");
          expect(res.body.data).to.have.deep.property("media");
          expect(res.body.data).to.have.deep.property("text");
          expect(res.body.data).to.have.deep.property("type");
          expect(res.body.data.type).to.contain.oneOf(["text", "media"]);
          expect(res.body.data.text).to.equal(
            "this is a random facebok post. please like, share and make comments"
          );
          expect(res.body.data.media).to.be.an("array");
          expect(res.body.data.media).to.have.a.lengthOf.greaterThanOrEqual(1);
          expect(res.body.data.author).to.equal(userId);

          done();
        });
    });
    it("it creates a new post with text and multiple media files", (done) => {
      chai
        .request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .set("content-type", "multipart/form-data")
        .field(
          "text",
          "this is a random facebok post. please like, share and make comments"
        )
        .attach(
          "media",
          fs.readFileSync(`${__dirname}/files/image1.jpg`),
          "files/image1.jpg"
        )
        .attach(
          "media",
          fs.readFileSync(`${__dirname}/files/image2.png`),
          "files/image2.png"
        )
        .attach(
          "media",
          fs.readFileSync(`${__dirname}/files/image3.gif`),
          "files/image3.gif"
        )
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.deep.property("_id");
          expect(res.body.data).to.have.deep.property("media");
          expect(res.body.data).to.have.deep.property("text");
          expect(res.body.data).to.have.deep.property("type");
          expect(res.body.data.type).to.contain.oneOf(["text", "media"]);
          expect(res.body.data.text).to.equal(
            "this is a random facebok post. please like, share and make comments"
          );
          expect(res.body.data.media).to.be.an("array");
          expect(res.body.data.media).to.have.a.lengthOf.greaterThanOrEqual(1);
          expect(res.body.data.author).to.equal(userId);
          done();
        });
    });
    it("it creates a new post with media files only", (done) => {
      chai
        .request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .set("content-type", "multipart/form-data")
        .field("type", "media")
        .attach(
          "media",
          fs.readFileSync(`${__dirname}/files/vid.mp4`),
          "files/vid.mp4"
        )
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.deep.property("_id");
          expect(res.body.data).to.have.deep.property("media");
          expect(res.body.data).to.have.deep.property("type");
          expect(res.body.data.type).to.equal("media");
          expect(res.body.data.media).to.be.an("array");
          expect(res.body.data.media).to.have.a.lengthOf.greaterThanOrEqual(1);
          expect(res.body.data.author).to.equal(userId);
          done();
        });
    });
    it("it returns a 400 error if media file type is invalid", (done) => {
      chai
        .request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .set("content-type", "multipart/form-data")
        .field("type", "media")
        .attach(
          "media",
          fs.readFileSync(`${__dirname}/files/file.pdf`),
          "files/file.pdf"
        )
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.be.a("null");
          expect(res.body.message).to.equal("invalid media file sent");
          done();
        });
    });
    it("it returns a 400 error if post is empty", (done) => {
      chai
        .request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("data");
          expect(res.body).to.have.property("message");
          expect(res.body.data).to.be.a("null");
          done();
        });
    });
    it("it sends a 401 error if authorization token is absent or incorrect", (done) => {
      chai
        .request(app)
        .post("/posts")
        .set("content-type", "multipart/form-data")
        .field(
          "text",
          "this is a random facebok post. please like, share and make comments"
        )
        .attach(
          "media",
          fs.readFileSync(`${__dirname}/files/image1.jpg`),
          "files/image1.jpg"
        )
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
  describe("FETCH POSTS", () => {
    it("it fetches created posts", (done) => {
      chai
        .request(app)
        .get("/posts")
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
    it("it returns a 401 error if request is unauthenticated", (done) => {
      chai
        .request(app)
        .get("/posts")
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
  describe("FETCH POST", () => {
    it("it fetches a single post", (done) => {
      chai
        .request(app)
        .get(`/posts/${postId}`)
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
          done();
        });
    });
    it("it returns a 404 error if post is not found", (done) => {
      chai
        .request(app)
        .get(`/posts/${wrongPostId}`)
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
          expect(res.body.message).to.equal("post not found");
          done();
        });
    });
    it("it returns a 400 error if post id is an invalid object id", (done) => {
      chai
        .request(app)
        .get(`/posts/${wrongMongoId}`)
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
        .get(`/posts/${postId}`)
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
  describe("UPDATE POST", () => {
    it("it updates an existing post", (done) => {
      chai
        .request(app)
        .put(`posts/${postId}`)
        .set({ Authorization: `Bearer ${authToken}` })
        .set("content-type", "multipart/form-data")
        .field("text", "this is an update to a random facebok post")
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.deep.property("_id");
          expect(res.body.data).to.have.deep.property("media");
          expect(res.body.data).to.have.deep.property("text");
          expect(res.body.data.text).to.equal(
            "this is an update to a random facebok post"
          );
          done();
        });
    });
    it("it returns a 403 error if user is not author", (done) => {
      chai
        .request(app)
        .put(`posts/${dummyPostId}`)
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
    it("it returns a 404 error if post is not found", (done) => {
      chai
        .request(app)
        .put(`/posts/${wrongPostId}`)
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
          expect(res.body.message).to.equal("post not found");
          done();
        });
    });
    it("it returns a 400 error if post id is an invalid object id", (done) => {
      chai
        .request(app)
        .put(`/posts/${wrongMongoId}`)
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
    it("it sends a 401 error if authorization token is absent or incorrect", (done) => {
      chai
        .request(app)
        .put(`/posts/${postId}`)
        .set("content-type", "multipart/form-data")
        .field(
          "text",
          "this is a random facebok post. please like, share and make comments"
        )
        .attach(
          "media",
          fs.readFileSync(`${__dirname}/files/image1.jpg`),
          "files/image1.jpg"
        )
        .end((error, res) => {
          expect(error).to.be.null;
          expect(res).to.exist;
          expect(res).to.have.status(401);
          done();
        });
    });
  });
  describe("DELETE POST", () => {
    it("it deletes an existing post", (done) => {
      chai
        .request(app)
        .delete(`/posts/${postId}`)
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
    it("it returns a 404 error if post is not found", (done) => {
      chai
        .request(app)
        .delete(`/posts/${wrongPostId}`)
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
          expect(res.body.message).to.equal("post not found");
          done();
        });
    });
    it("it returns a 400 error if post id is an invalid object id", (done) => {
      chai
        .request(app)
        .delete(`/posts/${wrongMongoId}`)
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
        .delete(`posts/${dummyPostId}`)
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
        .delete(`/posts/${postId}`)
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
