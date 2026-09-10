import jwt from "jsonwebtoken";

// middleware to verify jwt token from cookie
export const authUser = async (req, res, next) => {
  // get access token from cookies
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied, No Token",
    });
  }

  try {
    // verify token with secret key
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // attach user id to request object for next route handlers
    req.user = { user: { _id: decodedToken.userId } };
    next();
  } catch (err) {
    next(err);
  }
};
