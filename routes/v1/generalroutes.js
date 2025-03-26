import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import {
  getAllEvents,
  mostbookings,
  demo,
  path,
} from "../../controllers/v1/generalopera.js";

const app = express();

app.use(express());

const router = express.Router();

/**
 * This module contains the routes for the general operations like  getting all events and most booked events.
 * @module routes/v1/generalroutes.js
 */

/**
 * ---> This route is to get all the events.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /general/allevents:
 *   get:
 *     summary: Retrieve all events
 *     description: Retrieve the total count of events and the list of all events from the events collection.
 *     tags:
 *       - GENERAL OPERATIONS
 *     responses:
 *       200:
 *         description: To get the total count of events and the list of all events from the events collection.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 "All Events Count In App:":
 *                   type: number
 *                   example: 73
 *                 Events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       eventname:
 *                         type: string
 *                         example: "Tech Conference 2025"
 *                       eventdate:
 *                         type: string
 *                         example: "2025-07-15"
 *                       eventlocation:
 *                         type: string
 *                         example: "Hyderabad"
 *                       amountrange:
 *                         type: number
 *                         example: 1500
 *                       eventtime:
 *                         type: string
 *                         example: "18:30:00"
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
 *                         example: "60f7b2c8e9f3c20017045a2d"
 *       404:
 *         description: Event not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Events model is empty"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error while retrieving all events from Events Model"
 */

router.get("/allevents", getAllEvents);

/**
 * ---> This route is to get the most booked events.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /general/mostbookings:
 *   get:
 *     summary: Retrieve the most booked events
 *     description: "Retrieve the list of most booked events in the app."
 *     tags:
 *       - GENERAL OPERATIONS
 *     responses:
 *       200:
 *         description: "Most booked Events in App:"
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
 *       500:
 *         description: "Server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error while retrieving most booked events"
 */

router.get("/mostbookings", mostbookings);

/**
 * ---> This route is to get the events based on the query parameters.
 * --->
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /general/query:
 *   get:
 *     summary: Fetches an Event by optional filtering through query parameters
 *     description: "Fetches an Event by optional filtering through query parameters."
 *     tags:
 *       - DEMO ROUTES
 *     parameters:
 *       - name: eventname
 *         in: query
 *         description: "Event name filter (optional)"
 *         schema:
 *           type: string
 *           example: "Tech Conference 2025"
 *       - name: eventlocation
 *         in: query
 *         description: "Event location filter (optional)"
 *         schema:
 *           type: string
 *           example: "Hyderabad"
 *       - name: amountrange
 *         in: query
 *         description: "Maximum amount range filter (optional)"
 *         schema:
 *           type: number
 *           example: 1500
 *     responses:
 *       200:
 *         description: "Events from the events collection:"
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
 *       404:
 *         description: "Event not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No events found"
 *       500:
 *         description: "Server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error for the demo rouet"
 */

router.get("/query", demo);

/**
 * ---> This route is to get the events based on the path parameters.
 * --->
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /general/path/{eventname}/{eventlocation}/{amountrange}:
 *   get:
 *     summary: Fetches an Event by optional filtering through path/route parameters
 *     description: "Fetches an Event by optional filtering through path/route parameters."
 *     tags:
 *       - DEMO ROUTES
 *     parameters:
 *       - name: eventname
 *         in: path
 *         description: "Event name filter (optional)"
 *         schema:
 *           type: string
 *           example: "Tech Conference 2025"
 *       - name: eventlocation
 *         in: path
 *         description: "Event location filter (optional)"
 *         schema:
 *           type: string
 *           example: "Hyderabad"
 *       - name: amountrange
 *         in: path
 *         description: "Maximum amount range filter (optional)"
 *         schema:
 *           type: number
 *           example: 1500
 *     responses:
 *       200:
 *         description: "Events from the events collection:"
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
 *       404:
 *         description: "Event not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No events found"
 *       500:
 *         description: "Server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error for the demo path route"
 */

router.get("/path/:eventname/:eventlocation/:amountrange", path);

export default router;
