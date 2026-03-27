import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // attach id + role to request
      next();
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(401).json({ message: "Not authorized" });
    }
  } else {
    console.warn("No Bearer token found in Authorization header");
  }

  if (!token) {
    console.warn("No token provided. Access denied.");
    return res.status(401).json({ message: "No token" });
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
