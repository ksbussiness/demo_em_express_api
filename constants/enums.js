import "../instrument.js";
import * as Sentry from "@sentry/node";
import  express from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { othermessages} from "../messages/othermessages.js";

const app = express();


app.use(express.json());

export const roleAuthentication = async (req, res) => {
  let { role } = req.body;
  console.log("Role give when registering is :", role);
    let enums = ["user", "admin"];
    if (!enums.includes(role)) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: ReasonPhrases.BAD_REQUEST,
        message:othermessages.constenums.enumsmessagesA
      });
    }
    console.log("role outs side")
};
