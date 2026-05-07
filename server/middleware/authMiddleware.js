import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { supabase } from "../utils/supabase.js";

const protectRoute = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;
  console.log("Token received:", token);

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      const { data: resp, error } = await supabase
        .from("users")
        .select("is_admin, email")
        .eq("_id", decodedToken.userId)
        .single();

      if (error || !resp) throw new Error("User not found");

      req.user = {
        email: resp.email,
        isAdmin: resp.is_admin,
        userId: decodedToken.userId,
      };

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      return res
        .status(401)
        .json({ status: false, message: "Not authorized. Try login again." });
    }
  } else {
    return res
      .status(401)
      .json({ status: false, message: "Not authorized. Try login again." });
  }
});

const isAdminRoute = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "Not authorized as admin. Try login as admin.",
    });
  }
};

export { isAdminRoute, protectRoute };
