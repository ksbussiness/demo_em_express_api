import "../../instrument.js";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import nodemailer from "nodemailer";
import validator from "validator";
import Logs from "../../models/LoginLogoutDetails.js";
import UsersDetails from "../../models/UsersDetails.js";
import { controllermessages } from "../../messages/controllermessages.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";

const app = express();

// Middleware to parse JSON
app.use(express.json());

app.use(cors());

console.log("Starting authopera.js...");

export const otpStore = {};

/**
 * //  This is the register controller for register the admin/user
 * @param {*} req - > The request object contains the  username and password email and role
 * @param {*} res  -> If user created successfully then we get an message "user created successfully"
 * @returns
 */
export const register = async (req, res) => {
  console.log("iam inside the register controller");

  let { username, password, email, role } = req.body;

  // Sanitization of the data
  username = validator.escape(validator.stripLow(username, true));
  password = validator.escape(validator.stripLow(password, true));
  email = validator.normalizeEmail(
    validator.escape(validator.stripLow(email, true))
  );
  role = validator.escape(validator.stripLow(role, true));

  console.log("data from the body for creating the new user");

  try {
    let existingUser = await UsersDetails.findOne({ username });
    console.log(
      "Checking for existing user:",
      username,
      "Found:",
      existingUser
    );

    if (existingUser) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: controllermessages.authoperations.resA });
    }

    let user = new UsersDetails({ username, email, password, role });

    await user.save();

    console.log("The endUser registered,with the  details:", user);

    res
      .status(StatusCodes.CREATED)
      .json({ message: controllermessages.authoperations.resB });
  } catch (err) {
    console.error("Error creating user:", err);
    Sentry.captureException(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.authoperations.resC });
  }
};

export const otpGeneration = async (req, res) => {
  let { username } = req.body;

  // Sanitization of the data
  username = validator.escape(validator.stripLow(username, true));

  try {
    let user = await UsersDetails.findOne({ username });

    console.log(
      "checking for the user for the password updating Before :",
      user
    );

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: ReasonPhrases.NOT_FOUND,
        message: controllermessages.authoperations.otpA,
      });
    }

    const secretkey = speakeasy.generateSecret({ length: 20 });

    // Generate a TOTP code using the secret key
    const Otpcode = speakeasy.totp({
      // Use the Base32 encoding of the secret key
      secret: secretkey.base32,

      // Tell Speakeasy to use the Base32
      encoding: "base32",

      window: 10,
    });

    otpStore[username] = { secretKey: secretkey.base32, user };

    console.log("Data before going in to the opt middleware", otpStore);
    console.log("Secret: ", secretkey.base32);
    console.log("Code: ", Otpcode);

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "tia.morissette19@ethereal.email",
        pass: "ZhEpMPfV7Wq6f7r1cx",
      },
    });

    await transporter.sendMail({
      from: "sachin53@ethereal.email",
      to: user.email,
      subject: "OTP Verification",
      text: `Your OTP for verification is: ${Otpcode} and The secret key is :${secretkey.base32}`,
    });

    console.log("Secret key stored in the request object:", req.secretKey);
    console.log("User info stored in the request object:", req.user);

    return res
      .status(StatusCodes.OK)
      .json({ message: controllermessages.authoperations.otpB });
  } catch (err) {
    Sentry.captureException(err);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: controllermessages.authoperations.otpC,
    });
  }
};

/**
 * // THE PASSWORD uPDATION CONTROLLER LOGIC
 * Updates the user's password and email after verifying the provided OTP.
 *
 * This function checks if the user exists and verifies the provided OTP using the secret key.
 * If the OTP is valid, it updates the user's email and/or password and saves the changes.
 *
 * @param {} request - The request object containing the body with email, password, and OTP.
 * @param {} reply - The reply object used to send the response back to the client. and if otp verified sussfully we get a called message
 *  'OTP Verified! Password updated successfully'
 *
 * @returns A success message if the OTP is valid and the password is updated successfully.
 * Sends an error response if the user is not found, the OTP is invalid, or an exception occurs.
 */
export const passwordUpdation = async (req, res) => {
  let { email, password, otp } = req.body;

  let { secretKey, user } = req;

  console.log(req.secretKey);
  console.log(req.user);

  // Sanitization of the data
  if (req.body.email) {
    email = validator.normalizeEmail(
      validator.escape(validator.stripLow(email, true))
    );
  }
  password = validator.escape(validator.stripLow(password, true));

  try {
    console.log(
      "checking for the user for the password updating Before :",
      user
    );

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: ReasonPhrases.NOT_FOUND,
        message: controllermessages.authoperations.passA,
      });
    }

    if (email) {
      user.email = email;
      user.markModified("email");
    }

    if (password) {
      user.password = password;
      user.markModified("password");
      console.log(user.password);
    }

    console.log("the key for otp updation is:");

    if (otp) {
      console.log("the secretke key code :", secretKey);
      console.log("the otp going for verification", otp);
      let isValid = speakeasy.totp.verify({
        secret: secretKey,
        encoding: "base32",
        token: otp,
        window: 10,
      });

      console.log(isValid);

      console.log("the otp in th ebody is :", otp);

      if (!isValid) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: ReasonPhrases.BAD_REQUEST,
          message: controllermessages.authoperations.passB,
        });
      }

      console.log("Otp verification:", isValid);

      await user.save();
      user.isModified("password");
      console.log("updated user:",user)

      return res
        .status(StatusCodes.OK)
        .json({ message: controllermessages.authoperations.passC });
    }
  } catch (err) {
    Sentry.captureException(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.authoperations.passD });
  }
};

/**
 
// THE LOGIN CONTROLLER LOGIC 
 * @param {*} request --> In the request body we send the username , password
 * @param {*} reply  ---> If user is succesfully logged in then we gt the JWT Token
 * @returns 
 */
export const login = async (req, res) => {
  let { username, password } = req.body;

  username = validator.escape(validator.stripLow(username, true));
  password = validator.escape(validator.stripLow(password, true));

  try {
    console.log(req.body);
    let user = await UsersDetails.findOne({ username });

    console.log("User found for login:", user ? user._id : "No user found");

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: controllermessages.authoperations.loginA });
    }

    console.log("user details while logging in:", user);
    console.log("before comparing the password", user.password);

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password match:", isMatch);

    if (!isMatch)
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: controllermessages.authoperations.loginB });

    let payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.SEC);

    console.log(token);

    let existingLog = await Logs.findOne({ UserId: user._id });

    console.log(existingLog, "exisiting loger details here");

    await Logs.findOneAndUpdate(
      { UserId: user._id },
      {
        logintime: Date.now(),
        logouttime: null,
        UserToken: token,
      },
      { upsert: true, new: true }
    );

    console.log("Sending login response with token:", token);

    res.status(StatusCodes.OK).json({ token });
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.authoperations.loginC });
  }
};

/**
 * // THE LOGOUT CONTROLLER LOGIC
 * @param {*} request --> Here in the request body we donot send any fileds
 * @param {*} reply ---> if user is provided the tokn in the headers then he will be logged out succfully
 * @returns
 */
export const logout = async (req, res) => {
  try {
    let authHeader = req.headers["authorization"];
    console.log("Logout attempt, received token:", authHeader);
    let token = authHeader && authHeader.split(" ")[1];

    let decoded = jwt.verify(token, process.env.SEC);
    let userId = decoded.id;
    console.log(userId);

    const userlogs = await Logs.findOne({ UserId: userId });

    console.log("User logs for logout:", userlogs);

    userlogs.logouttime = Date.now();
    userlogs.UserToken = null;

    await userlogs.save();

    res.json({ message: controllermessages.authoperations.logoutB });
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.authoperations.logoutC });
  }
};
