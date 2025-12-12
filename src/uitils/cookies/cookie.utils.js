import 'dotenv/config';

const isProd = process.env.NODE_ENV === "production";

export const setAuthRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Strict", // None for local dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const setAuthAccessCookie = (res, token) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};
