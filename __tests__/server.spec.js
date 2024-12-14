const request = require("supertest");
const express = require("express");
const app = require("../server");

describe("Server Endpoints", () => {
    it("should respond with 200 for the API docs endpoint", async () => {
        const res = await request(app).get("/api-docs");
        expect(res.statusCode).toEqual(200);
    });

    it("should respond with 404 for an unknown endpoint", async () => {
        const res = await request(app).get("/unknown");
        expect(res.statusCode).toEqual(404);
    });
});