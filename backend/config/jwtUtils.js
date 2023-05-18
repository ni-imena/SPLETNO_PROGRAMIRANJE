const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key'; // Replace with your own secret key

function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired.' });
            } else {
                return res.status(401).json({ message: 'Invalid token.' });
            }
        }
        req.user = decoded;
        next();
    });
}

module.exports = verifyToken;
