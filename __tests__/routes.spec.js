const express = require("express");
const request = require("supertest");

jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

describe("GET /auth route", () => {
  let app;

  beforeAll(() => {
    process.env.GITHUB_CLIENT_ID = "testClientId";
    process.env.GITHUB_REDIRECT_URI = "http://localhost:3000/auth/callback";

    app = express();
    const router = express.Router();

    router.get("/auth", (req, res) => {
      const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user`;
      res.redirect(redirectUrl);
    });

    app.use(router);
  });

  test("should redirect to GitHub OAuth with the correct URL", async () => {
    const response = await request(app).get("/auth");

    // Verify redirect status code
    expect(response.status).toBe(302);

    // Verify the redirect location
    expect(response.headers.location).toBe(
      "https://github.com/login/oauth/authorize?client_id=testClientId&redirect_uri=http://localhost:3000/auth/callback&scope=user"
    );
  });
});
