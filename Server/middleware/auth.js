const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // Source token from httpOnly cookie only (CRIT-04 fix)
    // Authorization header kept as fallback for backward compatibility during migration
    let token = req.cookies.token;

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY, { algorithms: ['HS256'] });
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }
};

module.exports = authenticate;