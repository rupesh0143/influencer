// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();

// const secret = process.env.JWT_KEY;

// const authMiddleWare = async (req, res, next) => {
//     try {

//         const token = req.headers.authorization.split(" ")[1];
//         console.log(token);
//         if (token) {
//             const decoded = jwt.verify(token, secret);
//             console.log(decoded);

//             req.body._id = decoded?.id;
//         }

//         next();
//     } catch (error) {
//         console.log(error);
//     }
// }


// export default authMiddleWare;

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET; // Updated to match AuthController.js

const authMiddleWare = async (req, res, next) => {
    try {
        // Check if Authorization header exists and starts with "Bearer"
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided or invalid format' });
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.split(' ')[1];

        // Verify the token
        const decoded = jwt.verify(token, secret);

        // Attach user ID to request object (to match MySQL table schema)
        req.user = { id: decoded.id, email: decoded.email };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export default authMiddleWare;