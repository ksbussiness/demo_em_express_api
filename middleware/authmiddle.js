import "../instrument.js";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import Logs from "../models/LoginLogoutDetails.js";
import { othermessages } from "../messages/othermessages.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const app = express();
app.use(express.json());
app.use(cors());

export default async (req, res, next) => {
  let authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: othermessages.middlewares.authmiddlewareA });
  }

  console.log(token);

  try {
    // Verify the JWT token
    let decoded = jwt.verify(token, process.env.SEC);
    let userId = decoded.id;

    console.log("FROM MIDDLEWARE ", decoded);

    // Check if the user has an active session in the Logs model
    const userLogs = await Logs.findOne({ UserId: userId });

    console.log(userLogs, "I am from the logs model");

    // If no logs are found or if the UserToken is null, it means the user is logged out
    if (!userLogs || userLogs.UserToken === null) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .json({ error: othermessages.middlewares.authmiddlewareB });
    }

    req.user = decoded;

    console.log("end of the middlware");
  } catch (err) {
    Sentry.captureException(err);

    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: othermessages.middlewares.authmiddlewareC });
  }
};
