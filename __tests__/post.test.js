const mongoose = require('mongoose');
const _ = require('lodash');
const request = require('supertest');

const app = require('../src/app')
const PostData = {
    text: 'A new facebook post',
    media: '/C:/Users/SeyiOgunjuyigbe/Downloads/build-a-bot-logo.png',
};

// test for authorizarion
describe("POST /posts", () => {
    test('attempt to create post without authorization', async () => {
        beforeAll(async () => {
            await mongoose.connect(global.__MONGO_URL__, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
            });
        })
        const response = await request(app)
            .post("/posts")
            .set('Content-Type', "multipart/form-data");
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("message", "No authorization header was found");
        expect(response.statusCode).toBe(401);
    })
})