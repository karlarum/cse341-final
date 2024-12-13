// Import jsonwebtoken module to work with JWTs
const jwt = require("jsonwebtoken");

// Import decodeAuthToken so it can be tested
const { decodeAuthToken } = require("../src/session");

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
