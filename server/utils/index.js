import jwt from "jsonwebtoken";

const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/", // IMPORTANT: Send cookie for ALL routes, not just the login path
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
};

export default createJWT;
