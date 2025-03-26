import express from "express";
import auth from "../../middleware/authmiddle.js";
import roleauth from "../../middleware/roleauth.js";
import AllHeader from "../../validators/AllHeader.js";
import Allparams from "../../validators/Allparams.js";
import UgetAll from "../../validators/Ugetall.js";
import { UlocValidation } from "../../validators/Uloc.js";
import { routesmessages } from "../../messages/routesmessages.js";
import { UeventbookValidation } from "../../validators/Ueventbook.js";
import EMgetEventsValidation from "../../validators/EMgetEvents.js";
import { UeventbookEditValidation } from "../../validators/Uupdate.js";
import { UeventbookDeleteValidation } from "../../validators/Udelete.js";
import {
  loc,
  locationevent,
  eventbook,
  getallbookings,
  booking,
  eventdelete,
} from "../../controllers/v1/BookingsController.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";

const app = express();
app.use(express());

const router = express.Router();

/**
 * This module contains the routes for the bookings related.
 * @module routes/v1/BookingsRoutes.js
 */

/**
 * ---> This route is to provide the location.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /booking/location:
 *   post:
 *     summary: Save user location (Authenticated Users Only)
 *     description: Save user location (Authenticated Users Only)
 *     tags:
 *       - BOOKING-USER
 *     security:
 *       - BearerAuth: []
 *     requestHeaders:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Authorization:
 *                 type: string
 *                 description: "Bearer token for authentication"
 *                 example: "Bearer your_jwt_token_here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventneedlocation:
 *                 type: string
 *                 example: amc
 *                 description: Location needed for the event
 *     responses:
 *       200:
 *         description: Location saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Location saved for this user
 *       400:
 *         description: Bad request (validation error in the header)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: The authorization header is required, to provide the location of the user
 *       405:
 *         description: Bad request (validation error in the body, here it is not matching as per the requirements)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: The body is not matching as per requirements, to provide the location of the user
 *       406:
 *         description: User logged out so need to re-login (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is logged out, access denied
 *       498:
 *         description: Invalid token or expired token (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or expired token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: getting the error while giving the event location
 */

router.post(
  "/location",

  async (req, res) => {
    let { error: authError } = UlocValidation.authorizationValidation.validate({
      authorization: req.headers["authorization"], // Accessing the header value
    });

    if (authError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.bookingroutes.locationA,
      });
    }

    let { error: bodyError } = UlocValidation.userLocationValidation.validate(
      req.body
    );

    if (bodyError) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.bookingroutes.locationB,
      });
    }
    await auth(req, res);

    loc(req, res);
  }
);

/**
 * ---> This route is to get the events for the particular location
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /booking/eventsforlocation:
 *   get:
 *     summary: Get events based on the user's saved location (Authenticated Users Only)
 *     description: Get events based on the user's saved location (Authenticated Users Only)
 *     tags:
 *       - BOOKING-USER
 *     security:
 *       - BearerAuth: []
 *     requestHeaders:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Authorization:
 *                 type: string
 *                 description: "Bearer token for authentication"
 *                 example: "Bearer your_jwt_token_here"
 *     responses:
 *       200:
 *         description: List of events for the user's location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 No Of Event Found  for this location:
 *                   type: number
 *                   example: 73
 *                 Events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 679a61e495e3ea757f90448e
 *                       eventname:
 *                         type: string
 *                         example: holifest
 *                       eventdate:
 *                         type: string
 *                         example: 2025-07-15
 *                       eventlocation:
 *                         type: string
 *                         example: amc
 *                       amountrange:
 *                         type: number
 *                         example: 1500
 *                       eventtime:
 *                         type: string
 *                         example: 18:30:00
 *                       totalseats:
 *                         type: integer
 *                         example: 200
 *                       availableseats:
 *                         type: integer
 *                         example: 180
 *                       bookedseats:
 *                         type: integer
 *                         example: 20
 *                       userId:
 *                         type: string
 *                         example: 60f7b2c8e9f3c20017045a2d
 *                       __v:
 *                         type: number
 *                         example: 0
 *       400:
 *         description: Bad request (validation errors in the header)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: The authorization header is required, to get the events for the particular location.
 *       404:
 *         description: User not provided the location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide your location first.
 *       405:
 *         description: No events found for the user's location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No events found for this location
 *       406:
 *         description: User is logged out so needs to re-login (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is logged out, access denied
 *       498:
 *         description: Invalid token or expired token (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or expired token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error while retrieving events.
 */

router.get(
  "/eventsforlocation",

  async (req, res) => {
    let { error } = EMgetEventsValidation.validate({
      authorization: req.headers["authorization"],
    });

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.bookingroutes.eventsforlocationA,
      });
    }

    await auth(req, res);

    locationevent(req, res);
  }
);

/**
 * ---> This route is to book the events for the provied location.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /booking/eventit/{id}:
 *   post:
 *     summary: Book an event by specifying the number of seats (Authenticated Users Only)
 *     description: Book an event by specifying the number of seats (Authenticated Users Only)
 *     tags:
 *       - BOOKING-USER
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID (MongoDB ObjectId format)
 *         example: 65d9f5e7b2eabc1234567890
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NoOfSeatsBooking:
 *                 type: number
 *                 description: Number of seats to book
 *                 example: 2
 *     responses:
 *       200:
 *         description: Event booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 679a61e495e3ea757f90448e
 *                 eventid:
 *                   type: string
 *                   example: 679a61e495e3ea757f90448e
 *                 eventManager:
 *                   type: string
 *                   example: John Doe
 *                 eventManagerEmail:
 *                   type: string
 *                   example: johndoe@example.com
 *                 eventname:
 *                   type: string
 *                   example: Tech Meetup 2025
 *                 eventdate:
 *                   type: string
 *                   format: date
 *                   example: 2025-08-20
 *                 eventlocation:
 *                   type: string
 *                   example: Hyderabad
 *                 eventtime:
 *                   type: string
 *                   example: 18:00:00
 *                 amountrange:
 *                   type: number
 *                   example: 10
 *                 NoOfSeatsBooking:
 *                   type: number
 *                   example: 2
 *                 eventBookedBy:
 *                   type: string
 *                   example: Alice Smith
 *                 email:
 *                   type: string
 *                   example: alicesmith@example.com
 *                 AmountNeedPay:
 *                   type: number
 *                   example: 20
 *                 userId:
 *                   type: string
 *                   example: 679a611595e3ea757f90448b
 *       400:
 *         description: Bad request (validation errors or missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: The authorization header is required, while booking the no of seats for the event
 *       405:
 *         description: Bad request (missing fields in the body)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: The body is missing the required format while booking the event
 *       408:
 *         description: Event is fully booked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: event is fully booked
 *       410:
 *         description: Exceeds the maximum number of seats that can be booked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: maximum number of seats can be booked :${event.availableseats}, so please reduce the number of seats
 *       406:
 *         description: User logged out so need to re-login (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is logged out, access denied
 *       498:
 *         description: Invalid token or expired token (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or expired token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error while booking the event.
 */

router.post(
  "/eventit/:id",

  async (req, res) => {
    let { error: authError } =
      UeventbookValidation.authorizationValidation.validate({
        authorization: req.headers["authorization"],
      });

    if (authError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.bookingroutes.bookingeventA,
      });
    }

    let { error: NoSeatsError } =
      UeventbookValidation.userNoOfSeatsValidation.validate(req.body);

    if (NoSeatsError) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.bookingroutes.bookingeventB,
      });
    }

    await auth(req, res);

    eventbook(req, res);
  }
);

/**
 * ---> This route is to get all  the bookings of the user.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /booking/all:
 *   get:
 *     summary: Retrieve all bookings for the authenticated user
 *     description: Retrieve all bookings for the authenticated user
 *     tags:
 *       - BOOKING-USER
 *     security:
 *       - BearerAuth: []
 *     requestHeaders:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Authorization:
 *                 type: string
 *                 description: "Bearer token for authentication"
 *                 example: "Bearer your_jwt_token_here"
 *     responses:
 *       200:
 *         description: Successfully retrieved all bookings for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 679a61e495e3ea757f90448e
 *                   eventid:
 *                     type: string
 *                     example: 679a61e495e3ea757f90448e
 *                   eventManager:
 *                     type: string
 *                     example: John Doe
 *                   eventManagerEmail:
 *                     type: string
 *                     example: johndoe@example.com
 *                   eventname:
 *                     type: string
 *                     example: Tech Meetup 2025
 *                   eventdate:
 *                     type: string
 *                     format: date
 *                     example: 2025-08-20
 *                   eventlocation:
 *                     type: string
 *                     example: Hyderabad
 *                   eventtime:
 *                     type: string
 *                     example: 18:00:00
 *                   amountrange:
 *                     type: number
 *                     example: 10
 *                   NoOfSeatsBooking:
 *                     type: number
 *                     example: 2
 *                   eventBookedBy:
 *                     type: string
 *                     example: Alice Smith
 *                   email:
 *                     type: string
 *                     example: alicesmith@example.com
 *                   AmountNeedPay:
 *                     type: number
 *                     example: 20
 *                   userId:
 *                     type: string
 *                     example: 679a611595e3ea757f90448b
 *       400:
 *         description: Bad request (invalid authorization header)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: The authorization header is required, to get all bookings for this user
 *       406:
 *         description: User is logged out so need to re-login (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is logged out, access denied
 *       498:
 *         description: Invalid token or expired token (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or expired token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error while retrieving all bookings
 */

router.get(
  "/all",

  async (req, res) => {
    let { error } = UgetAll.validate({
      authorization: req.headers["authorization"],
    });

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.bookingroutes.getallbookingsA,
      });
    }
    await auth(req, res);
    getallbookings(req, res);
  }
);

/**
 * ---> This route is to update a booking.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /booking/bookings/{id}:
 *   put:
 *     summary: Update the number of seats in an existing booking (Authenticated Users Only)
 *     description: Update the number of seats in an existing booking (Authenticated Users Only)
 *     tags:
 *       - BOOKING-USER
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID (MongoDB ObjectId format)
 *         example: 67bb5b1d2d2dcf2ff5fcf43c
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NoOfSeatsBooking:
 *                 type: number
 *                 description: Updated number of seats to book
 *                 example: 5
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 67bb5b1d2d2dcf2ff5fcf43c
 *                 eventid:
 *                   type: string
 *                   example: 67bb05727378475620a68456
 *                 eventManager:
 *                   type: string
 *                   example: Virat
 *                 eventManagerEmail:
 *                   type: string
 *                   example: Virat@example.com
 *                 eventname:
 *                   type: string
 *                   example: Isha-event
 *                 eventdate:
 *                   type: string
 *                   format: date
 *                   example: 2043-02-03
 *                 eventlocation:
 *                   type: string
 *                   example: nkd
 *                 eventtime:
 *                   type: string
 *                   example: 18:15:10
 *                 amountrange:
 *                   type: number
 *                   example: 1000
 *                 NoOfSeatsBooking:
 *                   type: number
 *                   example: 5
 *                 eventBookedBy:
 *                   type: string
 *                   example: Iyer
 *                 email:
 *                   type: string
 *                   example: Iyer@example.com
 *                 AmountNeedPay:
 *                   type: number
 *                   example: 5000
 *                 userId:
 *                   type: string
 *                   example: 67bb433447d1ae255518cf53
 *       208:
 *         description: No change in booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: you are given same number of seats, so no changes in your booking
 *       400:
 *         description: Bad request (validation errors in the header)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: The authorization header is required, while updating the bookings of the no of seats for the event
 *       405:
 *         description: Bad request (validation errors in the body)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: The Body is not Matching has per the requirements, give correct body for updation
 *       408:
 *         description: Bad request (validation errors in the params)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: The params is not Matching has per the requirements, give correct params id for updation
 *       410:
 *         description: Bad request (event not found for the given id)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: event not found for the given params id while updation
 *       415:
 *         description: Bad request (No of seats are not available for the booking)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: maximum number of seats can be booked :${event1.availableseats}, so please reduce the number of seats
 *       406:
 *         description: User is logged out so need to re-login (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is logged out, access denied
 *       498:
 *         description: Invalid token or expired token (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or expired token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error while updating the booking.
 */

router.put(
  "/bookings/:id",

  async (req, res) => {
    let { error: authError } =
      UeventbookEditValidation.authorizationValidation.validate({
        authorization: req.headers["authorization"],
      });

    if (authError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.bookingroutes.updateNoOfseatsA,
      });
    }

    const { error: UserUpdationError } =
      UeventbookEditValidation.userNoOfSeatsEditValidation.validate(req.body);

    if (UserUpdationError) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.bookingroutes.updateNoOfseatsB,
      });
    }

    let { error: UserparamsgivenError } =
      UeventbookEditValidation.usergivenparams.validate(req.params);

    if (UserparamsgivenError) {
      return res.status(StatusCodes.REQUEST_TIMEOUT).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.bookingroutes.updateNoOfseatsC,
      });
    }

    await auth(req, res);
    booking(req, res);
  }
);

/**
 * ---> This route is to cancelling booking  of the event.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /booking/cc/{id}:
 *   delete:
 *     summary: Cancel an event booking by providing the booking ID (Authenticated Users Only)
 *     description: Cancel an event booking by providing the booking ID (Authenticated Users Only)
 *     tags:
 *       - BOOKING-USER
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID (MongoDB ObjectId format)
 *         example: 65d9f5e7b2eabc1234567890
 *     responses:
 *       200:
 *         description: Event booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: event booking cancelled successfully
 *       400:
 *         description: Bad request (validation errors in the header)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: The authorization header is required, while cancelling the event booking
 *       405:
 *         description: Bad request (validation errors in the params)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: The params is not Matching has per the requirements, give correct params id for cancelling the event booking
 *       408:
 *         description: Bad request (validation errors - bookings not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: bookings not found
 *       406:
 *         description: User is logged out so need to re-login (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is logged out, access denied
 *       498:
 *         description: Invalid token or expired token (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or expired token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error while deleting the booking.
 */

router.delete(
  "/cc/:id",

  async (req, res) => {
    let { error: authError } =
      UeventbookDeleteValidation.authorizationValidation.validate({
        authorization: req.headers["authorization"],
      });

    if (authError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.bookingroutes.canceleventbookingA,
      });
    }

    let { error: UserparamsgivenError } =
      UeventbookDeleteValidation.usergivenparams.validate(req.params);

    if (UserparamsgivenError) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.bookingroutes.canceleventbookingB,
      });
    }

    await auth(req, res);

    eventdelete(req, res);
  }
);

export default router;
