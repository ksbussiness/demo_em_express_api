import express from "express";
import joi from "joi";

const app = express();
app.use(express.json());

const usergivenparams = joi.object({
  id: joi
    .string()
    .pattern(/^[0-9a-fA-F]{24}$/, "MongoDB ObjectId")
    .required()
    .trim(),
});
export default usergivenparams;
