import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [process.env.FRONTEND_URL];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS error: Request from unauthorized origin"));
    }
  },
};
