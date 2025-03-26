import "../../instrument.js";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import validator from "validator";
import Event from "../../models/EventsDetails.js";
import UsersDetails from "../../models/UsersDetails.js";
import LocationsOfUsers from "../../models/LocationsOfUsers.js";
import EventBookingsDetails from "../../models/EventBookingsDetails.js";
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

/**
 * // this controller deals with the  providing the location
 * This is the  contoller endpoint deals with providing the location
 * @param {*} request --> here in the request body we send the loction by which we need to get the events
 * @param {*} reply --> here  in the reply we get the Object, in which we have the message: location saved for this user
 */
export const loc = async (req, res) => {
  let { eventneedlocation } = req.body;

  // Sanitization of the data
  eventneedlocation = validator.escape(
    validator.stripLow(eventneedlocation, true)
  );

  try {
    const event = new LocationsOfUsers({
      eventneedlocation,
      userId: req.user.id,
    });
    console.log(req.user.id);

    await event.save();

    res
      .status(StatusCodes.OK)
      .json({ message: controllermessages.bookingscontoller.locationA });
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: controllermessages.bookingscontoller.locationB });
  }
};

/**
// This is the controller for getting the events based on the provided location

 * @param {*} request --> In this controller logic we do not send any request object 
 * @param {*} reply --> In the reply we get the cout of the events and an EVENTS array in which we have the all the events pf the given location
 * @returns 
 */
export const locationevent = async (req, res) => {
  try {
    console.log(req.user.id);

    let userLocation = await LocationsOfUsers.findOne({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log(userLocation);

    if (!userLocation) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: controllermessages.bookingscontoller.eventlocationA });
    }

    let location = userLocation.eventneedlocation.toLowerCase();

    let LocationBasedEvents = await Event.find({ eventlocation: location });

    let Count = await Event.aggregate([
      { $match: { eventlocation: location } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    console.log("To know the cout of the  given location:", Count);

    if (!LocationBasedEvents || LocationBasedEvents.length === 0) {
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: controllermessages.bookingscontoller.eventlocationB });
    }

    res.json({
      "No Of Event Found  for this location":
        Count.length > 0 ? Count[0].count : 0,
      Events: LocationBasedEvents,
    });
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.bookingscontoller.eventlocationC });
  }
};

/**
 // This is the controller logic deals  for event booking 
 * @param {*} request ---> In this request object we send the "NoOfSeatsBooking" for booking  the event." And we send the Id of the event off which we need to book.
 * @param {*} reply  ---> In the reply we get the an object which contains all the details related to the booking of the Event {
 * EX: 
 * {
  "_id": "679a61e495e3ea757f90448e",
  "eventid": "679a61e495e3ea757f90448e",
  "eventManager": "John Doe",
  "eventManagerEmail": "johndoe@example.com",
  "eventname": "Tech Meetup 2025",
  "eventdate": "2025-08-20",
  "eventlocation": "Hyderabad",
  "eventtime": "18:00:00",
  "amountrange": 10,
  "NoOfSeatsBooking": 2,
  "eventBookedBy": "Alice Smith",
  "email": "alicesmith@example.com",
  "AmountNeedPay": 20,
  "userId": "679a611595e3ea757f90448b"
}}
 * @returns 
 */
export const eventbook = async (req, res) => {
  let { NoOfSeatsBooking } = req.body;

  // Sanitization of the data
  //NoOfSeatsBooking = validator.escape(validator.stripLow(NoOfSeatsBooking, true));

  try {
    const event = await Event.findById(req.params.id);

    console.log("Events details:", event);

    if (event.availableseats === 0) {
      return res
        .status(StatusCodes.REQUEST_TIMEOUT)
        .json({ message: controllermessages.bookingscontoller.eventbookingA });
    }

    if (NoOfSeatsBooking > event.availableseats) {
      return res
        .status(StatusCodes.GONE)
        .json({
          message: `maximum number of seats can be booked :${event.availableseats}, so please reduce the number of seats`,
        });
    }

    console.log(event);

    let UserIdFromEvents = event.userId;
    console.log(UserIdFromEvents);

    const user = await UsersDetails.findById(UserIdFromEvents);
    console.log("user details based on the event info:", user);
    let eventid = event._id;

    let eventname = event.eventname;
    let eventdate = event.eventdate;
    let eventlocation = event.eventlocation;
    let amountrange = event.amountrange;
    let eventtime = event.eventtime;
    let eventManager = user.username;
    let eventManagerEmail = user.email;
    console.log(req.user.id);

    let userInfo = await UsersDetails.findById(req.user.id);
    console.log(userInfo);
    let eventBookedBy = userInfo.username;
    let email = userInfo.email;
    let AmountNeedPay = event.amountrange * NoOfSeatsBooking;

    console.log({
      eventManager,
      eventManagerEmail,
      eventname,
      eventdate,
      eventlocation,
      amountrange,
      eventtime,
      eventBookedBy,
      email,
    });

    const BookingDetails = new EventBookingsDetails({
      eventid,
      eventManager,
      eventManagerEmail,
      eventname,
      eventdate,
      eventlocation,
      amountrange,
      eventtime,

      NoOfSeatsBooking,
      eventBookedBy,
      email,
      AmountNeedPay,
      userId: req.user.id,
    });

    await BookingDetails.save();

    res.status(StatusCodes.OK).json(BookingDetails);
    //const event1=await User.findById(request.user.id);

    const eventInfo = await Event.findById(req.params.id);

    (eventInfo.bookedseats =
      eventInfo.bookedseats + BookingDetails.NoOfSeatsBooking),
      (eventInfo.availableseats = eventInfo.totalseats - eventInfo.bookedseats);

    await eventInfo.save();
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.bookingscontoller.eventbookingB });
  }
};

/**
 * // This is the controller logic deals to get all the bookings of the user
 * @param {*} request ---> here we do not send any fileds in the request body
 * @param {*} reply  ---> In the reply we get an Array of the events booking details for which we booked"
 */
export const getallbookings = async (req, res) => {
  try {
    console.log(req.user.id, "sachin");
    const event = await EventBookingsDetails.find({ userId: req.user.id });

    res.status(StatusCodes.OK).json(event);
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.bookingscontoller.getbookingA });
  }
};

/**
 * This is the contoller logic deals to update the booking of the user
 *
 * @param {*} request --> In the request body we send the "NoOfSeatsBooking" fileds for updating our booking".And also we send the Id off the event we which we need to update in the URL
 *
 * @param {*} reply --> In the reply we get the object which contains all the details for the event booking with the updated NoOfSeats"
 * @returns
 */
export const booking = async (req, res) => {
  let { NoOfSeatsBooking } = req.body;
  // Sanitization of the data
  //NoOfSeatsBooking = validator.escape(validator.stripLow(NoOfSeatsBooking, true));

  try {
    console.log(req.user.id, "fecthing the user id");
    const book = await EventBookingsDetails.findByIdAndUpdate(req.params.id);
    console.log(book, "this is booking data");

    if (!book || book.userId.toString() !== req.user.id) {
      return res
        .status(StatusCodes.GONE)
        .json({ error: controllermessages.bookingscontoller.updatebookingsA });
    }

    const eventInfoUpdation = await Event.findByIdAndUpdate(book.eventid);

    if (NoOfSeatsBooking > eventInfoUpdation.availableseats) {
      return res
        .status(StatusCodes.UNSUPPORTED_MEDIA_TYPE)
        .json({
          message: `maximum number of seats can be booked :${eventInfoUpdation.availableseats}, so please reduce the number of seats`,
        });
    }

    if (book.NoOfSeatsBooking === NoOfSeatsBooking) {
      return res
        .status(208)
        .json({
          message: controllermessages.bookingscontoller.updatebookingsB,
        });
    }

    if (NoOfSeatsBooking) {
      if (book.NoOfSeatsBooking > NoOfSeatsBooking) {
        eventInfoUpdation.availableseats =
          eventInfoUpdation.availableseats +
          (book.NoOfSeatsBooking - NoOfSeatsBooking);

        eventInfoUpdation.bookedseats =
          eventInfoUpdation.totalseats - eventInfoUpdation.availableseats;

        book.AmountNeedPay = NoOfSeatsBooking * eventInfoUpdation.amountrange;

        book.NoOfSeatsBooking = NoOfSeatsBooking;
      } else if (book.NoOfSeatsBooking < NoOfSeatsBooking) {
        eventInfoUpdation.availableseats =
          eventInfoUpdation.availableseats -
          (NoOfSeatsBooking - book.NoOfSeatsBooking);

        eventInfoUpdation.bookedseats =
          eventInfoUpdation.totalseats - eventInfoUpdation.availableseats;

        book.AmountNeedPay = NoOfSeatsBooking * eventInfoUpdation.amountrange;

        book.NoOfSeatsBooking = NoOfSeatsBooking;
      }
    }
    await eventInfoUpdation.save();
    eventInfoUpdation.increment();
    await eventInfoUpdation.save();


    await book.save();
    book.increment();
    await book.save();


    res.status(StatusCodes.OK).json(book);
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.bookingscontoller.updatebookingsC });
  }
};

/**
 * This is the controller logic for cancelling the booking
 * @param {*} request ---> here in the request body we do not send any fields. But we need to send the id of the event in the URL
 * @param {*} reply ---> If the event is successfully cancelled we get the message "event booking cancelled successfully"
 * @returns
 */
export const eventdelete = async (req, res) => {
  try {
    const event = await EventBookingsDetails.findByIdAndDelete(req.params.id);

    if (!event || event.userId.toString() !== req.user.id) {
      return res
        .status(StatusCodes.REQUEST_TIMEOUT)
        .json({
          message: controllermessages.bookingscontoller.deletebookingsA,
        });
    }

    const SeatsBookingCount = event.NoOfSeatsBooking;

    const events = await Event.findByIdAndUpdate(event.eventid);
    events.bookedseats = events.bookedseats - SeatsBookingCount;
    events.availableseats = events.totalseats - events.bookedseats;

    await events.save();
    res
      .status(StatusCodes.OK)
      .json({ message: controllermessages.bookingscontoller.deletebookingsB });
  } catch (err) {
    Sentry.captureException(err);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: controllermessages.bookingscontoller.deletebookingsC });
  }
};
