import express from "express";
import joi from "joi";

const app = express();
app.use(express.json());

const authorizationValidation = joi.object({
  authorization: joi
    .string()
    .pattern(
      /^Bearer [A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/,
      "JWT Token"
    )
    .required()
    .trim(),
});

const userLocationValidation = joi.object({
  eventneedlocation: joi.string().min(3).max(30).required().trim(),
});

export const UlocValidation = {
  authorizationValidation,
  userLocationValidation,
};
