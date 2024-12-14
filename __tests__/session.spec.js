// Import jsonwebtoken module to work with JWTs
const jwt = require("jsonwebtoken");

// Import decodeAuthToken so it can be tested
const { ensureAuthenticated, decodeAuthToken } = require("../src/session");

// Mock jsonewebtoken to simulate token verification
jest.mock("jsonwebtoken");

// Define the testing suite
describe("Testing JSON Web Token authentication", () => {
  // Store SECRET_KEY to verify jwt during testing
  const secretKey = process.env.SECRET_KEY;

  afterEach(() => {
    // Clear mock calls & states after each test
    jest.clearAllMocks(); 
  });

  test("should return valid decoded token", () => {
    const mockToken = "valid.token";
    /* Simulate decoded payload returned by jwt.verify when a valid token is provided */
    const mockDecoded = { username: "user" };

    /* jwt.verify is mocked to return a decoded token without actually verifying the token */
    jwt.verify.mockReturnValue(mockDecoded);

    // Call decodedAuthToken with mocked token param
    const result = decodeAuthToken(mockToken);
    // process.env = { ...originalEnv, SECRET_KEY: undefind };

    // Test jwt.verify uses correct arguments (mocked)
    expect(jwt.verify).toHaveBeenCalledWith(mockToken, secretKey);
    // Test decodedAuthToken returns mocked payload
    expect(result).toEqual(mockDecoded);
  });

  test("should return null when the token is invalid", () => {
    // Simulates when invalid token is provided
    const mockToken = undefined;

    // Mock jwt.verify to throw invalid token error
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    // Call decodedAuthToken with invalid token
    const result = decodeAuthToken(mockToken);

    // Test jwt.verify uses correct arguments (mocked)
    expect(jwt.verify).toHaveBeenCalledWith(mockToken, secretKey);
    // Ensure function returns null when token invalid
    expect(result).toBeNull();
  });
});

// Define the testing suite
describe("Test JST authentication", () => {
  // Store SECRET_KEY to verify jwt during testing
  // const secretKey = process.env.SECRET_KEY;

  // beforeAll(() => {
  //   process.env.SECRET_KEY = mockSecretKey; // Mock secret key
  // });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  test("should return 401 from ensureAunthenticated when the token is invalid", () => {
    const mockToken = "Bearer valid.jwt.token";
    const mockDecoded = { user: "user" };

    // Mock req object with valid authorization header
    const req = {
      headers: {
        authorization: mockToken,
      }, 
      user: mockDecoded, 
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    ensureAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: Invalid token",
    });
  });

  test("should return 401 from ensureAunthenticated when the token is missing", () => {
    // Mock Express req and res objects
    const req = {
      headers: { 
        authorization: undefined 
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    ensureAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: No token provided",
    });
  });

  test("should decode valid token from req.headers.authorization", () => {
    const mockToken = "valid.token";
    // Simulate decoded payload 
    const mockDecoded = { username: "user" };

    // mocked to return a decoded token 
    jwt.verify.mockReturnValue(mockDecoded);

    // Call decodedAuthToken with mocked token param
    decodeAuthToken(mockToken);

    // Mock req object with valid authorization header
    let req = {
      headers: {
        authorization: mockToken,
      } 
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    ensureAuthenticated(req, res, next);

    expect(req.user).toEqual(mockDecoded);
    // Test decodedAuthToken returns mocked payload
    expect(next).toHaveBeenCalled();
    // Assert res.status or res.json is NOT called
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});