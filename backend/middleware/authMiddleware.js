import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id || decoded._id, role: decoded.role };
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Not authorized" });
  }
}

// Restrict by role
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      console.error("No req.user — something went wrong in protect middleware");
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      console.error(`User role ${req.user.role} not authorized for this route`);
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}
