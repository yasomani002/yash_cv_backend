const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req,res,next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized token" });
    }
}

const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET)
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid token");
    }
}

module.exports = {
    jwtAuthMiddleware,
    generateToken,
    verifyToken
};