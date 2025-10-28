import { publishTOQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { User } from "../model/user.js";
import { generateToken } from "../config/generateToken.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import type { Response } from "express";


export const loginUser = TryCatch(async (req, res) => {
    const {email} = req.body;
    const rateLimitKey =`otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
      return res.status(429).json({ message: "Too many requests." });
    }
    const otp=Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey=`otp:${email}`;
    await redisClient.set(otpKey,otp,{EX:300});
    await redisClient.set(rateLimitKey,"true",{EX:60});
    const message={
        to:email,
        subject:"OTP for login",
        body:`Your OTP for login is ${otp}. It is valid for 5 min`
    };
    await publishTOQueue("send-otp",message);
    res.status(200).json({message:"OTP sent successfully"}); 
});






export const verifyUser= TryCatch(async(req,res)=>{
   const {email,otp:enteredotp}=req.body;
   if(!email || !enteredotp) return res.status(400).json({message:"Email and OTP are required"});
   const otpKey=`otp:${email}`; 
   const storedotp=await redisClient.get(otpKey);
   if(!storedotp) return res.status(400).json({message:"Invalid OTP"});
   if(storedotp!==enteredotp) return res.status(400).json({message:"Invalid OTP"});
   await redisClient.del(otpKey);
   let user=await User.findOne({email});
   if(!user){
    const name=email.slice(0,8);
    user= await User.create({name,email}); 
   } 
    const token = generateToken(user);
    res.status(200).json({
      message:"user verifiend",
      user,
      token});
})

export  const myProfile=(req:AuthenticatedRequest,res:Response)=>{
    const user=req.user 
    res.json(user);
}

export const updateName=TryCatch(async(req:AuthenticatedRequest,res:Response)=>{
  const user = await User.findById(req.user?._id);
  if (!user) {
    return res.status(404).json({ message: "please login" });
  }
  user.name = req.body.name;
  await user.save();
  const token = generateToken(user);
  res.status(200).json({ message: "Name updated successfully", user , token });
});

export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res) => {
  const users = await User.find({});
  res.json(users);
});

export const getAUser = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});