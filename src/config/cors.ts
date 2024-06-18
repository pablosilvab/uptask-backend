import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(" ");
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS error: Request from unauthorized origin"));
    }
  },
};
