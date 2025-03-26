import express from "express";
import joi from "joi";

const app = express();
app.use(express.json());

const passwordUpdateValidation = joi.object({
  username: joi.string().alphanum().min(3).max(15).trim(),
  email: joi.string().email().trim().optional(),
  password: joi
    .string()
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z\\d\\W_]{8,30}$")
    )
    .required(),
  otp: joi.number().required().strict(),
});

export default passwordUpdateValidation;
