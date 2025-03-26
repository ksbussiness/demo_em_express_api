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

const EMbodyEditValidation = joi.object({
  eventname: joi.string().trim(),
  eventdate: joi.date(),
  eventlocation: joi.string().trim(),
  amountrange: joi.number().min(1).strict(),
  eventtime: joi
    .string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .trim(),
});

const usergivenparams = joi.object({
  id: joi
    .string()
    .pattern(/^[0-9a-fA-F]{24}$/, "MongoDB ObjectId")
    .required()
    .trim(),
});

export const EMupdateValidation = {
  authorizationValidation,
  EMbodyEditValidation,
  usergivenparams,
};
