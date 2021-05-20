const mongoose = require('mongoose');
const PostModel = require('../src/models/post.model');
const PostData = { name: 'TekLoon', gender: 'Male', dob: new Date(), loginUsing: 'Facebook' };
const app = require('../src/app')
const request = require('supertest')

test('User Model Test', async () => {
    beforeAll(async () => {
        await mongoose.connect(global.__MONGO_URL__, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log('test db connected')
        });
    })
    afterEach(async () => {
        return
    });
    const response = await request(app).get("/");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("message", "Hello World");
    expect(response.statusCode).toBe(200);
})