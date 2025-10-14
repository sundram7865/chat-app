import type { IUser } from "../model/user.js";
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../model/user.js";
export interface AuthenticatedRequest extends Request {
        user?: IUser | null;
  }

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction):
Promise<void> => {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
         res.status(401).json({message:"Unauthorized"});   
         return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
           res.status(401).json({ message: 'Token missing' });
           return;
        }
        const decodedValue = jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload;
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        req.user =decodedValue.user;
        next();
    }catch(error:any){
        res.status(401).json({
            message:"please login -JWT ERROR"
        })
    }
}


