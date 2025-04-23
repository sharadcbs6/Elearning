const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('Auth middleware: No token found'); // DEBUG LOG
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info to request
        req.user = decoded;
        console.log('Auth middleware: decoded user:', decoded); // DEBUG LOG
        next();
    } catch (error) {
        console.log('Auth middleware: Token is not valid', error); // DEBUG LOG
        res.status(401).json({ message: 'Token is not valid' });
    }
};
