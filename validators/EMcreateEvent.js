import express from "express";
import joi from "joi";

const app = express();
app.use(express.json());

const EMcreateEventValidation = joi.object({
  eventname: joi.string().required().trim(),
  //eventdate: Joi.date().greater('now').required(),  // Ensures the date is in the future
  eventdate: joi.date().required(),
  eventlocation: joi.string().required().trim(),
  amountrange: joi.number().min(1).required().strict(),
  eventtime: joi
    .string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required()
    .trim(),
  totalseats: joi.number().min(10).required().strict(),
  availableseats: joi.number().min(0).required().strict(),
  bookedseats: joi.number().min(0).required().strict(),
});

EMcreateEventValidation.requiredFieldsValidation = (data) => {
  const requiredFields = [
    "amountrange",
    "eventname",
    "eventdate",
    "eventlocation",
    "eventtime",
    "totalseats",
    "availableseats",
    "bookedseats",
  ];
  for (let field of requiredFields) {
    if (!(field in data)) {
      return {
        error: {
          message: "Missing required fields in the body@@@",
        },
      };
    }
  }
  return { error: null };
};

export default EMcreateEventValidation;
