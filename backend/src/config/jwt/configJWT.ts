import dotenv from "dotenv";
dotenv.config();

// Variable de entrono del JWT
export const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";