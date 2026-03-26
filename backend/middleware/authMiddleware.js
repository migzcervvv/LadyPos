import jwt from 'jsonwebtoken';

// Protect routes (logged-in users only)
export function protect(req, res, next) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded; // contains id + role
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No token' });
    }
}

// Restrict by role
export function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient role' });
        }
        next();
    };
}