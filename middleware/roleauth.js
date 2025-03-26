import "../instrument.js";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import { othermessages } from "../messages/othermessages.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";

const app = express();

app.use(express.json());

app.use(cors());

/**
 * ...> Middleware to check if the user have the  authenticated role or not
 *
 * ...> If the user does not have the required role, the middleware will return a response with an error message.
 */
export default (requiredRoles) => {
  console.log("iam in the  role middleware here ");
  return (req, res) => {
    if (!requiredRoles.includes(req.user.role)) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: othermessages.middlewares.rolemiddlewareA });
    }
  };
};
