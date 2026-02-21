import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        return next(new Error("المستخدم المرتبط بهذا الرمز لم يعد موجوداً"));
      }

      // Check if user changed password after token was issued
      if (req.user.passwordChangedAt) {
        const changedTimestamp = parseInt(
          req.user.passwordChangedAt.getTime() / 1000,
          10,
        );
        if (decoded.iat < changedTimestamp) {
          res.status(401);
          return next(
            new Error(
              "لقد تم تغيير كلمة المرور مؤخراً، يرجى تسجيل الدخول مرة أخرى",
            ),
          );
        }
      }

      // Check if token version matches
      if (decoded.tokenVersion !== req.user.tokenVersion) {
        res.status(401);
        return next(new Error("جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى"));
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error("غير مصرح، الرمز غير صالح"));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error("غير مصرح، يرجى تسجيل الدخول"));
  }
};
