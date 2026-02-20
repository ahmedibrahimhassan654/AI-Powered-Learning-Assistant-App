const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = "المصدر غير موجود";
    error = new Error(message);
    res.status(404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "هذه البيانات مسجلة بالفعل";
    error = new Error(message);
    res.status(400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new Error(message.join(", "));
    res.status(400);
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت";
    error = new Error(message);
    res.status(400);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    const message = "رمز التحقق غير صالح، يرجى تسجيل الدخول مرة أخرى";
    error = new Error(message);
    res.status(401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى";
    error = new Error(message);
    res.status(401);
  }

  // Syntax Error (e.g. malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    const message = "تنسيق بيانات غير صحيح";
    error = new Error(message);
    res.status(400);
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: error.message || "خطأ في السيرفر",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { errorHandler };
