import request from "supertest";
import app from "../../app";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import speakeasy from "speakeasy";
import nodemailer from "nodemailer";
import Logs from "../../models/LoginLogoutDetails";
import UsersDetails from "../../models/UsersDetails.js";
import { otpStore } from "../../controllers/v1/authopera";

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await app.listen(3054);

  await UsersDetails.deleteMany();
  await Logs.deleteMany();
});

afterAll(async () => {
  // await UsersDetails.deleteMany();
  await Logs.deleteMany();
  await app.close();

  //await Logs.deleteMany({})
  await mongoose.disconnect();
});

afterEach(async () => {
  await UsersDetails.deleteMany();
});

describe("Integration Test: Registration test cases for Controller and Routes", () => {
  it("should successfully register a new user", async () => {
    const userPayload = {
      username: "testuser1",
      password: "Password123",
      email: "testuser1@example.com",
      role: "admin",
    };

    const response = await request(app)
      .post(`/auth/register`)
      .send(userPayload);

    expect(response.statusCode).toBe(201);

    const userInDb = await UsersDetails.findOne({ username: "testuser1" });
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe("testuser1");
  });

  it("should return 403 fail if user already exists", async () => {
    const userPayload1 = {
      username: "testuser1",
      password: "Password123",
      email: "testuser1@example.com",
      role: "admin",
    };

    await request(app).post(`/auth/register`).send(userPayload1);

    const response = await request(app)
      .post(`/auth/register`)
      .send(userPayload1);

    expect(response.statusCode).toBe(403);
  });

  it("should return 400 for missing fields in registration", async () => {
    const invalidPayload = {
      username: "testuser2",
      password: "password123",
    };

    const response = await request(app)
      .post(`/auth/register`)
      .send(invalidPayload);

    expect(response.statusCode).toBe(400);
  });

  it("should return 401 for invalid email format", async () => {
    const invalidPayload = {
      username: "testuser3",
      password: "password123",
      email: "invalid-email",
      role: "admin",
    };

    const response = await request(app)
      .post(`/auth/register`)
      .send(invalidPayload);

    expect(response.statusCode).toBe(401);
  });

  it("should return 404 for invalid role", async () => {
    const invalidPayload = {
      username: "testuser3",
      password: "Password123",
      email: "testuser3@example.com",
      role: "admi",
    };

    const response = await request(app)
      .post(`/auth/register`)
      .send(invalidPayload);

    expect(response.statusCode).toBe(404);
  });

  jest.setTimeout(10000);
  it("should return 500 for server error", async () => {
    const userPayload = {
      username: "testuser1",
      password: "Password@123",
      email: "testuser1@example.com",
      role: "admin",
    };
    jest.spyOn(UsersDetails.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Simulated Server Error");
    });
    const response = await request(app)
      .post(`/auth/register`)
      .send(userPayload);

    expect(response.statusCode).toBe(500);

    UsersDetails.prototype.save.mockRestore();
  });
});

describe("Integration Test: OTP Generation test cases for Controller and Route", () => {
  it("should return 404 if the user does not exist", async () => {
    const otpPayload = { username: "nonExisten" };

    const response = await request(app)
      .post("/auth/otpGeneration")
      .send(otpPayload);

    expect(response.statusCode).toBe(404);
  });

  it("should successfully generate OTP and send email", async () => {
    const mockUser = new UsersDetails({
      username: "testuser2",
      email: "testuser1@example.com",
      password: "Password123",
      role: "user",
    });
    await mockUser.save();

    const otpPayload = { username: "testuser2" };

    const response = await request(app)
      .post("/auth/otpGeneration")
      .send(otpPayload);

    // Check if the email is sent (you can use Ethereal for test SMTP)
    const transport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "tia.morissette19@ethereal.email",
        pass: "ZhEpMPfV7Wq6f7r1cx",
      },
    });

    // Verify that the response status code is OK (200)
    expect(response.statusCode).toBe(200);
  });

  it("should handle internal server error if something goes wrong", async () => {
    const mockUser = new UsersDetails({
      username: "testuser1",
      email: "testuser1@example.com",
      password: "Password@123",
      role: "user",
    });
    await mockUser.save();

    const sendMailMock = jest
      .spyOn(nodemailer, "createTransport")
      .mockReturnValueOnce({
        sendMail: jest.fn().mockRejectedValue(new Error("SMTP server failure")),
      });

    const otpPayload = { username: "testuser1" };

    const response = await request(app)
      .post("/auth/otpGeneration")
      .send(otpPayload);

    // Expect a 500 (Internal Server Error) since sending email failed
    expect(response.statusCode).toBe(500);

    // Verify that the sendMail method was called and failed
    expect(sendMailMock).toHaveBeenCalled();
  });
});

describe("Integration Tests: login test cases for controller and route", () => {
  beforeEach(async () => {
    let testUser = new UsersDetails({
      username: "testuser",
      email: "testuser123@gmail.com",
      password: "Password@123",
      role: "user",
    });

    await testUser.save();
  });

  it("should return 400 for missing fields", async () => {
    let payload = {
      username: "",
    };
    const response = await request(app).post("/auth/login").send(payload);

    expect(response.statusCode).toBe(400);
  });

  it("should return 401 for validation error", async () => {
    let payload = {
      username: "invalid!user",
      password: "testpassword",
    };

    const response = await request(app).post("/auth/login").send(payload);

    expect(response.statusCode).toBe(401);
  });

  it("should return 404 for non-existent user", async () => {
    let payload = {
      username: "testuserq",
      password: "Password@123",
    };

    const response = await request(app).post("/auth/login").send(payload);

    expect(response.statusCode).toBe(404);
  });

  it("should return 200 and a token for valid login credentials", async () => {
    let payload = {
      username: "testuser",
      password: "Password@123",
    };

    const response = await request(app).post("/auth/login").send(payload);

    expect(response.statusCode).toBe(200);
  });

  it("should return 403 for invalid password", async () => {
    let payload = {
      username: "testuser",
      password: "Password@1234",
    };

    const response = await request(app).post("/auth/login").send(payload);

    expect(response.statusCode).toBe(403);
  });

  it("should return 500 on internal server error", async () => {
    jest.mock("bcrypt");
    bcrypt.compare = jest.fn().mockRejectedValue(new Error("Database error"));

    let payload = {
      username: "testuser",
      password: "TestPassrd@123",
    };

    const response = await request(app).post("/auth/login").send(payload);

    expect(response.statusCode).toBe(500);
  });
});

describe("Integration Tests: logout test cases for controller and route ", () => {
  let token;

  beforeEach(async () => {
    let testUser = new UsersDetails({
      username: "testuser",
      email: "testuser123@gmail.com",
      password: "Password@123",
      role: "user",
    });

    await testUser.save();

    const payload = { id: testUser._id, role: testUser.role };
    token = jwt.sign(payload, process.env.SEC);

    let testLog = new Logs({
      UserId: testUser._id,
      logintime: Date.now(),
      UserToken: token,
    });

    await testLog.save();
  });

  afterEach(async () => {
    await UsersDetails.deleteMany();
    await Logs.deleteMany();
  });

  it("should return 200 and a message for valid logout", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
  });

  it("should return 400 if token is not in expected format", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token.kj}`);

    expect(response.statusCode).toBe(400);
  });

  it("should return 406 if user is already logged out", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer `);

    expect(response.statusCode).toBe(406);
  });

  it("should return 500 for server error", async () => {
    jest.spyOn(Logs, "findOne").mockImplementationOnce(() => {
      throw new Error("Server error");
    });

    const response = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(500);

    jest.restoreAllMocks();
  });
});

describe("Integration Test : password updation test cases for the controller and routes ", () => {
  let user, secretKey, otp;

  beforeEach(async () => {
    user = new UsersDetails({
      username: "testuser2",
      email: "testuser123@gmail.com",
      password: "Password@123",
      role: "user",
    });

    await user.save();

    secretKey = speakeasy.generateSecret({ length: 20 }).base32;
    otp = speakeasy.totp({
      secret: secretKey,
      encoding: "base32",
      window: 10,
    });

    otpStore[user.username] = { secretKey, user };

    // Mock the nodemailer transport
    nodemailer.createTransport = jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue(true),
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "tia.morissette19@ethereal.email",
        pass: "ZhEpMPfV7Wq6f7r1cx",
      },
    });

    await transporter.sendMail({
      from: "sachin53@ethereal.email",
      to: user.email,
      subject: "OTP Verification",
      text: `Your OTP for verification is: ${otp} and The secret key is :${secretKey}`,
    });
  });

  afterEach(async () => {
    await UsersDetails.deleteMany();
    jest.resetAllMocks();
  });

  it("should return 200 and a message for valid password update", async () => {
    console.log("Secret Key in the test case:", secretKey);
    console.log("Generated OTP in the test case:", otp);

    let payload = {
      email: "testuser123@gmail.com",
      password: "NewPassword@123",
      otp: otp,
    };

    const response = await request(app).post("/auth/forgotPass").send(payload);

    expect(response.statusCode).toBe(200);
  });

  it("should return 401 if OTP is invalid", async () => {
    const passwordUpdatePayload = {
      email: "newemail@gmail.com",
      password: "Password@123",
      otp: "620663",
    };

    const response = await request(app)
      .post("/auth/forgotPass")
      .send(passwordUpdatePayload);

    expect(response.statusCode).toBe(401);
  });

  it("should return 404 if user does not exist", async () => {
    const user = request.user;

    if (user === null) {
      const passwordUpdatePayload = {
        email: "newemail@gmail.com",
        password: "ewPassword@123",
        otp: 678987,
      };

      const response = await request(app)
        .post("/auth/forgotPass")
        .send(passwordUpdatePayload);

      expect(response.statusCode).toBe(404);
    }
  });

  it("should return 400 if email format is invalid", async () => {
    const invalidEmail = "invalid-email";
    const passwordUpdatePayload = {
      email: invalidEmail,
      password: "NewPassword123",
      otp: 657345,
    };

    const response = await request(app)
      .post("/auth/forgotPass")
      .send(passwordUpdatePayload);

    expect(response.statusCode).toBe(400);
  });

  it("should return 500 if there is a server error", async () => {
    jest.spyOn(speakeasy, "totp").mockImplementation(() => {
      throw new Error("Simulated server error during OTP verification");
    });

    const passwordUpdatePayload = {
      email: "testuser123@gmail.com",
      password: "New@Password123",
      otp: "6210663",
    };

    const response = await request(app)
      .post("/auth/forgotPass")
      .send(passwordUpdatePayload);

    expect(response.statusCode).toBe(500);
  });
});
