import { envMode } from "../app.js";

const errorMiddleware = (err, req, res, next) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;
  // console.log(err);
  if (err.code === 11000) {
    const error = Object.keys(err.keyPattern).join(",");
    err.message = `Duplicate field value entered for ${error}`;
    err.statusCode = 400;
  }
  if (err.name === "CastError") {
    const error = err.path;
    ((err.message = `invalid format of ${error}`), (err.statusCode = 400));
  }
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(envMode === "development" && { error: err }),
  });
};
const TryCatch = (passedFunction) => async (req, res, next) => {
  try {
    await passedFunction(req, res, next);
  } catch (err) {
    next(err);
  }
};
export { errorMiddleware, TryCatch };
