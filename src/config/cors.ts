import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    const whiteList = [process.env.FRONTEND_URL];
    if (whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS error"));
    }
  },
};