const userController = require('../controllers/userController');
const ensureAuthenticated = (req, res, next) => {
    const user = userController.getSession(req);
    if (user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Please log in.' });
    }
};


module.exports = { ensureAuthenticated };