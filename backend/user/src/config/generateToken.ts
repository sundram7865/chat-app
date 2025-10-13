import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const generateToken = (user: any) => {
    return jwt.sign({ user }, process.env.JWT_SECRET as string, {
        expiresIn: "15  d",
    });
};