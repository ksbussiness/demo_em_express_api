import express from "express";
import joi from "joi";

const app = express();
app.use(express.json());

const userLoginvalidation = joi.object({
  username: joi.string().alphanum().min(3).max(15).required().trim(),
  password: joi
    .string()
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z\\d\\W_]{8,30}$")
    )
    .required()
    .trim(),
});

userLoginvalidation.requiredFieldsValidation = (data) => {
  const requiredFields = ["username", "password"];
  for (let field of requiredFields) {
    if (!data[field]) {
      return {
        error: {
          message: "Missing required fields in the body",
        },
      };
    }
  }
  return { error: null };
};

export default userLoginvalidation;
