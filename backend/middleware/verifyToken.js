import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Freelancer from '../models/Freelancer.js';
import User from '../models/User.js';
import Influencer from '../models/Influencer.js';

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { id, role } = decoded;

        let userExists = false;

        switch (role) {
            case 'admin':
                userExists = await Admin.exists({ _id: id });
                break;
            case 'freelancer':
                userExists = await Freelancer.exists({ _id: id });
                break;
            case 'user':
                userExists = await User.exists({ _id: id });
                break;
            case 'influencer':
                userExists = await Influencer.exists({ _id: id });
                break;
            default:
                return res.status(403).json({ message: 'Invalid role in token' });
        }

        if (!userExists) {
            return res.status(404).json({ message: `${role} not found` });
        }

        // Only attach id and role
        req.user = { id, role };
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default verifyToken;