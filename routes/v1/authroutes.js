import express from "express";
import auth from "../../middleware/authmiddle.js";
import { roleAuthentication } from "../../constants/enums.js";
import userLoginvalidation from "../../validators/login.js";
import userLogoutValidation from "../../validators/logout.js";
import { routesmessages } from "../../messages/routesmessages.js";
import userRegisterValidation from "../../validators/registration.js";
import passwordUpdateValidation from "../../validators/passwordUpdation.js";
import { otpMiddleware } from "../../middleware/Otp_Validating_middleware.js";
import {
  register,
  login,
  logout,
  otpGeneration,
  passwordUpdation,
} from "../../controllers/v1/authopera.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";

const app = express();

// Middleware to parse JSON
app.use(express.json());

const router = express.Router();

/**
 * ---> This route is to register the user.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with username, email, password, and role.
 *     tags:
 *       - FOR REGISTRATION/LOGIN/LOGOUT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Raina"
 *                 description: Unique username of the user
 *               email:
 *                 type: string
 *                 example: "Raina123@gmail.com"
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 example: "Raina@123"
 *                 description: User's password (must include uppercase, lowercase, and number)
 *               role:
 *                 type: string
 *                 example: "admin"
 *                 description: Role of the user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *       400:
 *         description: Missing fields in the body
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
 *                   example: "Missing required fields in the body"
 *       401:
 *         description: Validation errors
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
 *                   example: "Validation failed body requirement not matching has per the requirements"
 *       403:
 *         description: Username already exists
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
 *                   example: "Username already exists. Try with another username"
 *       404:
 *         description: Invalid role provided
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
 *                   example: "Role not found, give a valid role while registering,roles:{user,admin}"
 *       406:
 *         description: User is logged out, re-login required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User is logged out, access denied"
 *       498:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "error creating the user"
 */

router.post("/register", async (req, res) => {
  let { error: missingFieldsError } =
    userRegisterValidation.requiredFieldsValidation(req.body);

  if (missingFieldsError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: ReasonPhrases.BAD_REQUEST,
      message: routesmessages.authroutes.registartionA,
    });
  }

  let { error: validationError } = userRegisterValidation.validate(req.body);
  console.log("iam in the validation error");

  if (validationError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: ReasonPhrases.BAD_REQUEST,
      message: routesmessages.authroutes.registartionB,
    });
  }

  console.log("iam outside the validation error");
  roleAuthentication(req, res);

  console.log("before going to the controller registartion");
  await register(req, res);
});

/**
 * ---> This route is to generate the otp.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /auth/otpGeneration:
 *   post:
 *     summary: Generate OTP for password recovery
 *     description: Sends an OTP to the user's registered email for password recovery.
 *     tags:
 *       - FOR REGISTRATION/LOGIN/LOGOUT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Raina"
 *                 description: User's username
 *     responses:
 *       200:
 *         description: OTP generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully To your provided Email-id"
 *       404:
 *         description: User not found
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
 *                   example: "User not found ! Please enter a valid username,if you are a new user please register first"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error while while  executing optGeneration"
 */

router.post("/otpGeneration", otpGeneration);

/**
 * ---> This route is to update the password.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /auth/forgotPass:
 *   post:
 *     summary: Update password using OTP
 *     description: Updates the user's password after verifying the OTP.
 *     tags:
 *       - FOR REGISTRATION/LOGIN/LOGOUT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "Raina123@gmail.com"
 *                 description: User's email address for password update
 *               password:
 *                 type: string
 *                 example: "Rain@1234"
 *                 description: New password (must include lowercase, uppercase, number, special character)
 *               otp:
 *                 type: integer
 *                 example: 123456
 *                 description: OTP sent to the user's email
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP verified! Password updated successfully"
 *       400:
 *         description: Validation errors
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
 *                   example: "Validation failed Body not matching the requirements check them once while updating the password"
 *       401:
 *         description: Invalid OTP
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
 *                   example: "Invalid OTP! please enter the valid OTP"
 *       404:
 *         description: User not found
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
 *                   example: "User not found ! Please enter a valid username,if you are a new user please register first"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error while updating the password"
 */

router.post(
  "/forgotPass",

  async (req, res) => {
    let { error } = passwordUpdateValidation.validate(req.body);

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.authroutes.passwordupdationA,
      });
    }

    otpMiddleware(req, res), await passwordUpdation(req, res);
  }
);

/**
 * ---> This route is to login the user.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login endpoint
 *     description: User login endpoint
 *     tags:
 *       - FOR REGISTRATION/LOGIN/LOGOUT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Raina"
 *                 description: Unique username of the user
 *               password:
 *                 type: string
 *                 example: "Raina@123"
 *                 description: User's password (must include uppercase, lowercase, number)
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "JWT authentication token"
 *       400:
 *         description: Missing fields in the body
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
 *                   example: "Missing required fields in the body"
 *       401:
 *         description: Validation failed body requirement not matching
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
 *                   example: "Validation failed body requirement not matching"
 *       403:
 *         description: Invalid credentials while logging in
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
 *                   example: "invalid credentials"
 *       404:
 *         description: When user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "user not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error while logging in the user"
 */

router.post(
  "/login",

  async (req, res) => {
    let { error: missingFieldsError } =
      userLoginvalidation.requiredFieldsValidation(req.body);

    if (missingFieldsError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.authroutes.loginmessagesA,
      });
    }

    let { error: validationError } = userLoginvalidation.validate(req.body);

    if (validationError) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.authroutes.loginmessagesB,
      });
    }

    await login(req, res);
  }
);

/**
 * ---> This route is to logout the user.
 * ---> This route has the preHandler middleware to validate the request body
 * ---> THis route has the swagger schema attached to it.
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout endpoint
 *     description: User logout endpoint
 *     tags:
 *       - FOR REGISTRATION/LOGIN/LOGOUT
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
 *                 description: Bearer token for authentication
 *                 example: "Bearer your_jwt_token_here"
 *     responses:
 *       200:
 *         description: Successful logout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User logged out successfully"
 *       400:
 *         description: Bad request (validation errors or missing token)
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
 *                   example: "Validation failed in the header requirement not matching"
 *       401:
 *         description: Unauthorized request (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "token required for the logging"
 *       415:
 *         description: No active session found for the given token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No active session found for this token"
 *       406:
 *         description: User is logged out, so need to re-login (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User is logged out, access denied"
 *       498:
 *         description: Invalid token or expired token (from the middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "error while logout of the current-user"
 */

router.post(
  "/logout",

  async (req, res) => {
    console.log(
      req.headers["authorization"],
      "this is the request header for me "
    );
    console.log(req.headers);

    let { error } = userLogoutValidation.validate({
      authorization: req.headers["authorization"],
    });

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: ReasonPhrases.BAD_REQUEST,
        message: routesmessages.authroutes.logoutmessagesA,
      });
    }

    auth(req, res), logout(req, res);
  }
);

export default router;
