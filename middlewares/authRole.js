export const authRole = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({error: "Access Denied. Not Allowed"});
        }
        next();
    }
};