import { Router } from "express";

export const userRouter = Router();

userRouter .post("/signup", (req, res) => {
  res.send("User signup");
}

userRouter .post("/signin", (req, res) => {
  res.send("User signin");
}