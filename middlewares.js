const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {

        const token = authHeader.split(' ')[1];
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, async function (err, data) {
                if (err) {
                    res.status(401);
                    return res.json({
                        'error': 'Invalid or expired token'
                    })
                } else {
                    req.data = data;
                    next();
                }
            })
        } else {
            res.status(401);
            return res.json({
                'error': 'Token not found'
            })
        }
    }
};

module.exports = {authenticateToken};