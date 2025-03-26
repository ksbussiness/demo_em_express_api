import "../../instrument.js";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import validator from "validator";
import Event from "../../models/EventsDetails.js";
import { controllermessages } from "../../messages/controllermessages.js";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

const app = express();

// Middleware to parse JSON
app.use(express.json());

app.use(cors());

/**
 *  This controller logic is deals with the creation of the event
 * @param {*} request --> In this endpoint we need to send the eventname,eventdate,eventlocation,amountrange,eventtime,totalseats,availableseats,bookedseats in the request body.For creating of the event.
 *
 * @param {*} reply ---> In the event details we get the an object which contains the eventname,eventdate,eventlocation,amountrange,eventtime,totalseats,availableseats,bookedseats with the field names.
 *
 * @returns
 */
export const createEvent = async (req, res) => {
  console.log(req.body);

  let {
    eventname,
    eventdate,
    eventlocation,
    amountrange,
    eventtime,
    totalseats,
    availableseats,
    bookedseats,
  } = req.body;

  // sanitization of the data
  eventname = validator.escape(validator.stripLow(eventname, true));
  eventdate = validator.escape(validator.stripLow(eventdate, true));
  eventlocation = validator.escape(validator.stripLow(eventlocation, true));
  eventtime = validator.escape(validator.stripLow(eventtime, true));

  let eventDate = new Date(eventdate);
  let currentDate = new Date();

  if (eventDate <= currentDate) {
    return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
      error: "Bad Request",
      message: "Event date must be in the future.",
    });
  }

  try {
    eventlocation = eventlocation.toLowerCase();
    const event = new Event({
      eventname,
      eventdate,
      eventlocation,
      amountrange,
      eventtime,
      totalseats,
      availableseats,
      bookedseats,
      userId: req.user.id,
    });

    const savedEvent = await event.save();
    return res.status(StatusCodes.OK).json({ event: savedEvent });
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.eventoperations.eventcreationA });
  }
};

/**
 * This controller logic is deals with the retrieves events for the current user.
 *
 * If the user is an admin, it fetches events associated with the user's ID.
 *
 * @param {*} request - The request object containing user information.
 * @param {*} reply - The reply object used to send the response.
 *
 * Sends the retrieved events as a response or an error message if an exception occurs.
 */
export const getevent = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    if (isAdmin) {
      const event = await Event.find({ userId: req.user.id });
      res.json(event);
    }
  } catch (error) {
    Sentry.captureException(error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: controllermessages.eventoperations.gettingeventsA,
    });
  }
};

/**
 * This controller logic is deals with the getting all the events based on the id.
 *
 * @param {*} request - The request object containing the id of the event in the params.
 * @param {*} reply - The reply object used to send the response.
 *
 * Sends the retrieved event as a response or an error message if an exception occurs.
 */
export const getbyid = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event || event.userId.toString() !== req.user.id) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: controllermessages.eventoperations.geteventbyidA });
    }

    res.json(event);
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.eventoperations.geteventbyidB });
  }
};

/**
 * This controller logic is deals with the updates of the event based on the id.
 *
 * @param {*} request - The request object containing the id of the event in the params and the eventname,eventdate,eventlocation,amountrange,eventtime in the request body
 * @param {*} reply - The reply object used to send the response.
 *
 * Sends the retrieved event as a response or an error message if an exception occurs.
 */
export const updateevent = async (req, res) => {
  let { eventname, eventdate, eventlocation, amountrange, eventtime } =
    req.body;

  // sanitization of the data
  eventname = validator.escape(validator.stripLow(eventname, true));
  eventdate = validator.escape(validator.stripLow(eventdate, true));
  eventlocation = validator.escape(validator.stripLow(eventlocation, true));
  eventtime = validator.escape(validator.stripLow(eventtime, true));

  let eventDate = new Date(eventdate);
  let currentDate = new Date();

  if (eventDate <= currentDate) {
    return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
      error: ReasonPhrases.BAD_REQUEST,
      message: controllermessages.eventoperations.updatebyidA,
    });
  }

  try {
    const event = await Event.findById(req.params.id);
    console.log(event, "result come ");

    if (!event || event.userId.toString() !== req.user.id) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: controllermessages.eventoperations.updatebyidB });
    }

    const updateData = {};

    if (eventname) updateData.eventname = eventname;
    if (eventdate) updateData.eventdate = eventdate;
    if (eventlocation) updateData.eventlocation = eventlocation;
    if (amountrange) updateData.amountrange = amountrange;
    if (eventtime) updateData.eventtime = eventtime;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: controllermessages.eventoperations.updatebyidC });
    }
    updatedEvent.save();
    updatedEvent.increment();
    res.status(StatusCodes.OK).json(updatedEvent);
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.eventoperations.updatebyidD });
  }
};

/**
 * This controller logic is deals with the deleting of the event based on the id.
 *
 * @param {*} request - The request object containing the id of the event in the params.
 * @param {*} reply - The reply object used to send the response.
 *
 * Sends a success message as a response or an error message if an exception occurs.
 */
export const deleteevent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event || event.userId.toString() !== req.user.id) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: controllermessages.eventoperations.deleteeventA });
    }

    res
      .status(StatusCodes.OK)
      .json({ message: controllermessages.eventoperations.deleteeventB });
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.eventoperations.deleteeventC });
  }
};
