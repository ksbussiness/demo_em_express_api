import "../../instrument.js";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import Event from "../../models/EventsDetails.js";
import { controllermessages } from "../../messages/controllermessages.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const app = express();

// Middleware to parse JSON
app.use(express.json());

app.use(cors());

/**
 * // This is the controller for getting all the events
 *
 * @param {*} request - here in the request we do not send any fields in the request body.
 * @param {*} reply - here we get the reply object which contains the count of all events and an array of all events from the Events model.
 *
 * If there is an error while retrieving all events from the Events Model then we get a error message "Server error while retrieving all events from Events Model"
 */
export const getAllEvents = async (req, res) => {
  try {
    const allEvents = await Event.aggregate([
      { $match: {} },
      {
        $group: { _id: null, count: { $sum: 1 }, events: { $push: "$$ROOT" } },
      },
    ]);

    if (allEvents.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: controllermessages.generaloperations.getalleventsA });
    }

    let Response = {
      "All Events Count In App:": allEvents[0].count,
      Events: allEvents[0].events,
    };

    console.log("Response", Response);
    res.json(Response);
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.generaloperations.getalleventsB });
  }
};

/**
 * This controller retrieves events with the most bookings, defined as events where the
 * number of booked seats exceeds 80% of the total seats available.
 *
 * @param {*} request - here in the request we do not send any fields in the request object and no fields required in the request body.
 * @param {*} reply - The reply object which will contain an array of events that have
 *                    the most bookings.
 *
 * Logs the events with the most bookings to the console. In case of an error, sends a 500 status with an error message "Server error while retrieving most booked events"
 */
export const mostbookings = async (req, res) => {
  try {
    const mostbooking = await Event.find({
      $expr: {
        $gt: [
          "$bookedseats",
          {
            $ceil: {
              $divide: [{ $multiply: ["$totalseats", 80] }, 100],
            },
          },
        ],
      },
    });
    console.log("mosting booking events:", mostbooking);

    res.status(StatusCodes.OK).json(mostbooking);
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.generaloperations.mostbookings });
  }
};

/**
 * // This is the controller for getting  the events based on the query parameters.
 *
 * @param {*} request - here in the request BODY  we do not send any fields in the but in the query fields we send different query parameters like eventname , eventlocation , amountrange.
 * @param {*} reply - here we get the reply object which contains  an array of all events from the Events model  based on the query parameters.
 *  we get an error message if event not found for the given query parameters.
 * If there is an error while retrieving all events from the Events Model then we get a error message "Server error for the demo rouet"
 */
export const demo = async (req, res) => {
  let query = req.query;
  console.log(query);
  let queryObject = {};

  for (let i in query) {
    if (i === "eventname") {
      const eventNames = query[i].split(",");
      console.log(eventNames);
      queryObject[i] = { $in: eventNames };
    } else if (i === "amountrange") {
      const maxAmount = Number(query[i]);
      queryObject[i] = { $gte: 0, $lte: maxAmount };
    } else if (i === "eventlocation") {
      const eventLocations = query[i].split(",");
      queryObject[i] = { $in: eventLocations };
    } else {
      queryObject[i] = query[i];
    }
  }

  try {
    console.log(queryObject, "updated before going to the database");
    const result = await Event.find(queryObject);

    if (result.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: controllermessages.generaloperations.queryA });
    }

    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    Sentry.captureException(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.generaloperations.queryB });
  }
};

/**
 * // This is the controller for getting  the events based on the path parameters.
 *
 * @param {*} request - here in the request BODY  we do not send any fields in the but in the path we defined some fields  like eventname , eventlocation , amountrange.
 * @param {*} reply - here we get the reply object which contains  an array of all events from the Events model  based on the matched path parameters.
 *  we get an error message if event not found for the given path parameters.
 * If there is an error while retrieving all events from the Events Model then we get a error message "Server error for the demo path route"
 */
export const path = async (req, res) => {
  let path = req.params;
  console.log(path);

  try {
    const result = await Event.find(path);

    if (result.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: controllermessages.generaloperations.pathA });
    }

    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    Sentry.captureException(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.generaloperations.pathB });
  }
};
