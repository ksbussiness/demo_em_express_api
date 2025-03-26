import express from "express";
import joi from "joi";

const app = express();
app.use(express.json());

const UgetAll = joi.object({
  authorization: joi
    .string()
    .pattern(
      /^Bearer [A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/,
      "JWT Token"
    )
    .required()
    .trim(),
});
export default UgetAll;
