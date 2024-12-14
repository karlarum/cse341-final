const userController = require('../controllers/userController');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log('No authorization header');
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader;

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Invalid token');
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = { ensureAuthenticated };