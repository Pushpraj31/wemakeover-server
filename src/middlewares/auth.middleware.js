import jwt from "jsonwebtoken";
import 'dotenv/config'
import { generateAccessToken } from "../uitils/tokens/jwt.utils.js";
import { setAuthAccessCookie } from "../uitils/cookies/cookie.utils.js";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const phoneNumberRegex = /^[6-9]\d{9}$/;

const validateSignup = (req, res, next) => {
  const { name, email, phoneNumber, password, confirmPassword } = req.body;

  if (!name || !email || !phoneNumber || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // validate password strength
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character." });
  }

  // validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // validate phone number format
  if (!phoneNumberRegex.test(phoneNumber)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }


  next();
}

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password) {
    return res.status(400).json({ success : false, message: "Email and password are required" });
  }
  if (!email) {
    return res.status(400).json({ success : false, message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ success : false, message: "Password is required" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ success : false, message: "Invalid email format" });
  }
  
  next();
};

const checkAuth = async (req, res, next) => {
  try {
    let accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    // CASE 1: No access token
    if (!accessToken) {
      if (!refreshToken) {
        return res.status(200).json({ success : false, loggedIn: false, message: "No access & refresh token" });
      }

      // verify refresh token and issue new access token
      try {
        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const newAccessToken = generateAccessToken(
          { id: decodedRefresh.id,  name : decodedRefresh.name,  role: decodedRefresh.role, email: decodedRefresh.email },
          "15m"
        );

        setAuthAccessCookie(res, newAccessToken);
        req.user = decodedRefresh;
        
        return next();
      } catch (refreshErr) {
        return res.status(403).json({ success : false, loggedIn: false, message: "Invalid refresh token" });
      }
    }

    // CASE 2: Access token exists, verify it
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      req.user = decoded;
      return next();

    } catch (err) {
      if (err.name === "TokenExpiredError") {
        if (!refreshToken) {
          return res.status(401).json({ success : false, loggedIn: false, message: "No refresh token" });
        }

        try {
          const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

          const newAccessToken = generateAccessToken(
            { id: decodedRefresh.id, name : decodedRefresh.name, role: decodedRefresh.role, email: decodedRefresh.email },
            "15m"
          );

          setAuthAccessCookie(res, newAccessToken);
          req.user = decodedRefresh;

          return next();
        } catch (refreshErr) {
          return res.status(403).json({ success : false, loggedIn: false, message: "Invalid refresh token" });
        }
      }

      return res.status(403).json({ success : false, loggedIn: false, message: "Invalid access token" });
    }
  } catch (err) {
    return res.status(500).json({ success : false, loggedIn: false, message: "Auth check failed" });
  }
};



// Alias for checkAuth to match the expected name
const authenticateToken = checkAuth;

// Admin role middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  
  next();
};

export { validateSignup, validateLogin, checkAuth, authenticateToken, requireAdmin };