import express from "express";
import cors from "cors";
import auth from "../../middleware/authmiddle.js";
import roleauth from "../../middleware/roleauth.js";
import AllHeader from "../../validators/AllHeader.js";
import Allparams from "../../validators/Allparams.js";
import { routesmessages } from "../../messages/routesmessages.js";
import EMgetEventsValidation from "../../validators/EMgetEvents.js";
import EMcreateEventValidation from "../../validators/EMcreateEvent.js";
import EMgetbyidEventsValidation from "../../validators/EMgetbyidEvent.js";
import { EMupdateValidation } from "../../validators/EMupdateValidation.js";
import { EMzDeleteValidation } from "../../validators/EMzdeleteEvent.js";

import {
  createEvent,
  getevent,
  getbyid,
  deleteevent,
  updateevent,
} from "../../controllers/v1/eventopera.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const app = express();
app.use(express());
app.use(cors());

const router = express.Router();

/**
 * This module contains the routes for the event creation related.
 * @module routes/v1/eventroutes.js
 */

/**
 * ---> This route is to create an event.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /event/create:
 *   post:
 *     summary: Create a new event (Admin Only)
 *     description: "Create a new event (Admin Only)"
 *     tags:
 *       - EVENT-MANAGEMENT-ADMIN
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
 *               eventname:
 *                 type: string
 *                 example: "holifest"
 *                 description: "Name of the event"
 *               eventdate:
 *                 type: string
 *                 example: "2025-07-15"
 *                 description: "Date of the event (must be in the future)"
 *               eventlocation:
 *                 type: string
 *                 example: "amc"
 *                 description: "Location where the event will be held"
 *               amountrange:
 *                 type: number
 *                 example: 1500
 *                 description: "Cost of attending the event"
 *               eventtime:
 *                 type: string
 *                 example: "18:30:00"
 *                 description: "Time of the event (24-hour format)"
 *               totalseats:
 *                 type: integer
 *                 example: 200
 *                 description: "Total number of seats available"
 *               availableseats:
 *                 type: integer
 *                 example: 200
 *                 description: "Number of available seats for booking"
 *               bookedseats:
 *                 type: integer
 *                 example: 0
 *                 description: "Number of seats already booked"
 *     responses:
 *       200:
 *         description: "Event created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60f7b2c8e9f3c20017045a2c"
 *                     eventname:
 *                       type: string
 *                       example: "holifest"
 *                     eventdate:
 *                       type: string
 *                       example: "2025-07-15"
 *                     eventlocation:
 *                       type: string
 *                       example: "amc"
 *                     amountrange:
 *                       type: number
 *                       example: 1500
 *                     eventtime:
 *                       type: string
 *                       example: "18:30:00"
 *                     totalseats:
 *                       type: integer
 *                       example: 200
 *                     availableseats:
 *                       type: integer
 *                       example: 180
 *                     bookedseats:
 *                       type: integer
 *                       example: 20
 *                     userId:
 *                       type: string
 *                       example: "60f7b2c8e9f3c20017045a2d"
 *                     __v:
 *                       type: number
 *                       example: 0
 *       400:
 *         description: "Bad request (validation errors header not matching has per requirements)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "Validation failed in the header requirement not matching 123 123"
 *       401:
 *         description: "Unauthorized request (user lacks permissions)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "User role not having the permissions to do"
 *       403:
 *         description: "Bad request missing required fields when creating the event"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "Missing required fields in the body when creating an event"
 *       404:
 *         description: "Bad request (validation errors body not matching has per requirements)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "Validation failed body requirement not matching when creating an event"
 *       405:
 *         description: "Bad request event date must be in the future"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "Event date must be in the future."
 *       406:
 *         description: "User is logged out so need to re-login (from the middleware)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User is logged out, access denied"
 *       498:
 *         description: "Invalid token or expired token (from the middleware)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       500:
 *         description: "Server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database save failed, Error creating the Event"
 */

router.post(
  "/create",

  async (req, res) => {
    let { error: headerError } = AllHeader.validate({
      authorization: req.headers["authorization"],
    });

    if (headerError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.eventroutes.createeventA,
      });
    }

    let { error: missingFieldsError } =
      EMcreateEventValidation.requiredFieldsValidation(req.body);

    if (missingFieldsError) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.eventroutes.createeventB,
      });
    }

    let { error: validateError } = EMcreateEventValidation.validate(req.body);

    if (validateError) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.eventroutes.createeventC,
      });
    }

    await auth(req, res);

    await roleauth(["admin"])(req, res);

    createEvent(req, res);
  }
);

/**
 * ---> This route is to get all  the  events of the particular event manager.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /event/get:
 *   get:
 *     summary: Get events based on user role (Admin & Users)
 *     description: "Get events based on user role (Admin & Users)"
 *     tags:
 *       - EVENT-MANAGEMENT-ADMIN
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
 *         description: "Events fetched successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60f7b2c8e9f3c20017045a2c"
 *                   eventname:
 *                     type: string
 *                     example: "Tech Conference 2025"
 *                   eventdate:
 *                     type: string
 *                     example: "2025-07-15"
 *                   eventlocation:
 *                     type: string
 *                     example: "Hyderabad"
 *                   amountrange:
 *                     type: number
 *                     example: 1500
 *                   eventtime:
 *                     type: string
 *                     example: "18:30:00"
 *                   totalseats:
 *                     type: integer
 *                     example: 200
 *                   availableseats:
 *                     type: integer
 *                     example: 180
 *                   bookedseats:
 *                     type: integer
 *                     example: 20
 *                   userId:
 *                     type: string
 *                     example: "60f7b2c8e9f3c20017045a2d"
 *                   __v:
 *                     type: number
 *                     example: 0
 *       400:
 *         description: "Bad request validation error header not matching has per requirements"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "The authorization header is required, to get the events of the particular event manager OR "
 *       401:
 *         description: "Unauthorized request"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "User role not having the permissions to do"
 *       406:
 *         description: "User is logged out so need to re-login (from the middleware)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User is logged out, access denied"
 *       498:
 *         description: "Invalid token or expired token (from the middleware)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       500:
 *         description: "Server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database failed while getting the events data"
 */

router.get(
  "/get",

  async (req, res) => {
    let { error } = EMgetEventsValidation.validate({
      authorization: req.headers["authorization"],
    });

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.eventroutes.getalleventsA,
      });
    }

    await auth(req, res);

    getevent(req, res);
  }
);

/**
 * ---> This route is to get a particular event based on Id.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /event/get/{id}:
 *   get:
 *     summary: Get event details by ID (Admin Only)
 *     description: "Get event details by ID (Admin Only)"
 *     tags:
 *       - EVENT-MANAGEMENT-ADMIN
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: "Event ID (MongoDB ObjectId format)"
 *         schema:
 *           type: string
 *           example: "65d9f5e7b2eabc1234567890"
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
 *         description: "Event details retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60f7b2c8e9f3c20017045a2c"
 *                 eventname:
 *                   type: string
 *                   example: "Tech Conference 2025"
 *                 eventdate:
 *                   type: string
 *                   example: "2025-07-15"
 *                 eventlocation:
 *                   type: string
 *                   example: "Hyderabad"
 *                 amountrange:
 *                   type: number
 *                   example: 1500
 *                 eventtime:
 *                   type: string
 *                   example: "18:30:00"
 *                 totalseats:
 *                   type: integer
 *                   example: 200
 *                 availableseats:
 *                   type: integer
 *                   example: 180
 *                 bookedseats:
 *                   type: integer
 *                   example: 20
 *                 userId:
 *                   type: string
 *                   example: "60f7b2c8e9f3c20017045a2d"
 *                 __v:
 *                   type: number
 *                   example: 0
 *       400:
 *         description: "Bad request headers not matching has per requirements"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "The authorization header is required, to get the events of the particular event manager based on the id"
 *       401:
 *         description: "Bad request parameters not matching has per requirements"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "params.id should match pattern \"^[0-9a-fA-F]{24}$\""
 *       404:
 *         description: "Event not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "event not found"
 *       406:
 *         description: "User is logged out so need to re-login (from the middleware)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User is logged out, access denied"
 *       498:
 *         description: "Invalid token or expired token (from the middleware)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       500:
 *         description: "Server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error while while executing the getbyId"
 */

router.get(
  "/get/:id",

  async (req, res) => {
    let { error: paramsError } = Allparams.validate(req.params);

    let { error } = EMgetbyidEventsValidation.validate({
      authorization: req.headers["authorization"],
    });

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.eventroutes.geteventbyidA,
      });
    }

    if (paramsError) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.eventroutes.geteventbyidB,
      });
    }

    await auth(req, res);

    getbyid(req, res);
  }
);

/**
 * ---> This route is to update the event.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /event/update/{id}:
 *   put:
 *     summary: Update an event by ID (Admin Only)
 *     description: Update an event by ID (Admin Only)
 *     tags:
 *       - EVENT-MANAGEMENT-ADMIN
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 65d9f5e7b2eabc1234567890
 *         description: Event ID (MongoDB ObjectId format)

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventname:
 *                 type: string
 *                 example: Tech-Meetup-2025
 *               eventdate:
 *                 type: string
 *                 example: 2025-08-20
 *               eventlocation:
 *                 type: string
 *                 example: hyd
 *               amountrange:
 *                 type: number
 *                 example: 2000
 *               eventtime:
 *                 type: string
 *                 example: 14:00:00
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 60f7b2c8e9f3c20017045a2c
 *                 eventname:
 *                   type: string
 *                   example: Tech Conference 2025
 *                 eventdate:
 *                   type: string
 *                   example: 2025-07-15
 *                 eventlocation:
 *                   type: string
 *                   example: Hyderabad
 *                 amountrange:
 *                   type: number
 *                   example: 1500
 *                 eventtime:
 *                   type: string
 *                   example: 18:30:00
 *                 totalseats:
 *                   type: integer
 *                   example: 200
 *                 availableseats:
 *                   type: integer
 *                   example: 180
 *                 bookedseats:
 *                   type: integer
 *                   example: 20
 *                 userId:
 *                   type: string
 *                   example: 60f7b2c8e9f3c20017045a2d
 *       400:
 *         description: Bad request headers not matching as per the requirements
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
 *                   example: The authorization header is required, to update the events of the particular event manager
 *       401:
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *                 message:
 *                   type: string
 *                   example: User role not having the permissions to do
 *       403:
 *         description: Bad request params id is not matching as per the requirements
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
 *                   example: The id is required, to update the events of the particular event manager
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: event not found
 *       405:
 *         description: Bad request event date must be in the future
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
 *                   example: Event date must be in the future.
 *       410:
 *         description: Bad request the body is not matching has per the requirements
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
 *                   example: The body is not matching has per requirements, to update the events of the particular event manager
 *       406:
 *         description: User is logged out so need to re-login (middleware error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is logged out, access denied
 *       498:
 *         description: Invalid token or expired token (middleware error)
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
 *                   example: Internal Server Error while updating the event
 */

router.put(
  "/update/:id",

  async (req, res) => {
    let { error: authError } =
      EMupdateValidation.authorizationValidation.validate({
        authorization: req.headers["authorization"],
      });

    console.log("Authorization header:", req.headers["authorization"]);

    if (authError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.eventroutes.updateeventA,
      });
    }

    let { error: paramsIdError } = EMupdateValidation.usergivenparams.validate(
      req.params
    );

    if (paramsIdError) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.eventroutes.updateeventB,
      });
    }

    let { error: bodyError } = EMupdateValidation.EMbodyEditValidation.validate(
      req.body
    );

    if (bodyError) {
      return res.status(StatusCodes.GONE).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.eventroutes.updateeventC,
      });
    }

    await auth(req, res), await roleauth(["admin"])(req, res);

    updateevent(req, res);
  }
);

/**
 * ---> This route is to delete the event.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /event/delete/{id}:
 *   delete:
 *     summary: Delete an event by ID (Admin Only)
 *     description: Delete an event by ID (Admin Only)
 *     tags:
 *       - EVENT-MANAGEMENT-ADMIN
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 65d9f5e7b2eabc1234567890
 *         description: Event ID (MongoDB ObjectId format)
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: event deleted successfully
 *       400:
 *         description: Bad request headers not matching as per the requirements
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
 *                   example: The authorization header is required, to delete the events of the particular event manager
 *       405:
 *         description: Bad request params id is not matching as per the requirements
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
 *                   example: The id is required, to delete the events of the particular event manager
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: event not found
 *       406:
 *         description: User is logged out so need to re-login (middleware error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is logged out, access denied
 *       498:
 *         description: Invalid token or expired token (middleware error)
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
 *                   example: Internal Server Error while deleting the event
 */

router.delete(
  "/delete/:id",

  async (req, res) => {
    let { error: authError } =
      EMzDeleteValidation.authorizationValidation.validate({
        authorization: req.headers["authorization"],
      });

    console.log("Authorization header:", req.headers["authorization"]);

    if (authError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.eventroutes.deleteeventA,
      });
    }

    let { error: paramsIdError } = EMzDeleteValidation.usergivenparams.validate(
      req.params
    );

    if (paramsIdError) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.eventroutes.deleteeventB,
      });
    }
    await auth(req, res), await roleauth(["admin"])(req, res);

    deleteevent(req, res);
  }
);

export default router;
