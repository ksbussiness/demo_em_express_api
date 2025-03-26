import express from "express";
import { otpStore } from "../controllers/v1/authopera.js";

const app = express();
app.use(express.json());

/**
 * Middleware to attach OTP-related data to the request object.
 * 
 * Extracts the first username from the otpStore and assigns the corresponding
 * secretKey and user information to the request object for further processing.
 * @param {*} request - The request object to which the OTP data is attached.
 
 */

export const otpMiddleware = async (req, res, next) => {
  // Get the first key from otpStore
  let username = Object.keys(otpStore)[0];

  console.log("Extracted username from otpStore:", username);
  console.log("Stored OTP data:", otpStore);

  // Directly assign values from otpStore
  req.secretKey = otpStore[username]?.secretKey;
  req.user = otpStore[username]?.user;

  console.log("Middleware attached data:", req.secretKey, req.user);
};
