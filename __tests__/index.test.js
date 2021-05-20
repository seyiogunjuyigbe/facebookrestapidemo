const app = require('../src/app')
const request = require('supertest')

describe("GET /", () => {
    test('index route Test', async () => {
        const response = await request(app).get("/");
        expect(response.body).toHaveProperty("data", null);
        expect(response.body).toHaveProperty("message", "Hello World");
        expect(response.statusCode).toBe(200);
    })
})