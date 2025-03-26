import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Event from "../../models/EventsDetails.js";
import Logs from "../../models/LoginLogoutDetails.js";
import UsersDetails from "../../models/UsersDetails.js";

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await app.listen(3064);

  await UsersDetails.deleteMany();
  await Logs.deleteMany();
  await Event.deleteMany();
});

afterAll(async () => {
  await UsersDetails.deleteMany();
  await Event.deleteMany();
  await mongoose.disconnect();
});

jest.setTimeout(200000);

describe("Integration Test: to get all events", () => {
  beforeEach(async () => {
    let testUser = new UsersDetails({
      username: "testuser",
      email: "testuser123@gmail.com",
      password: "Password@123",
      role: "admin",
    });

    await testUser.save();

    let payload = { id: testUser._id, role: testUser.role };
    let token = jwt.sign(payload, process.env.SEC);

    const testLog = new Logs({
      UserId: testUser._id,
      logintime: Date.now(),
      UserToken: token,
    });

    await testLog.save();
  });

  it("should respond with 200 and retrieve all events", async () => {
    let testEvent = new Event({
      eventname: "testevent",
      eventdate: "2025-07-15",
      eventlocation: "amc",
      amountrange: 100,
      eventtime: "18:30:00",
      totalseats: 200,
      availableseats: 200,
      bookedseats: 0,
      userId: "67d27648560c7a46081d1e5b",
    });

    await testEvent.save();

    const response = await request(app).get("/general/allevents");
    expect(response.statusCode).toBe(200);
  });

  it("should respond with 404 if no events are found", async () => {
    Event.aggregate = async () => {
      return [];
    };

    const response = await request(app).get("/general/allevents");
    expect(response.statusCode).toBe(404);
  });

  it("should respond with 500 for server errors", async () => {
    const originalAggregate = Event.aggregate;
    Event.aggregate = () => {
      throw new Error("Simulated Database Error");
    };

    const response = await request(app).get("/general/allevents");
    expect(response.statusCode).toBe(500);

    Event.aggregate = originalAggregate;
  });
});

describe("Integration Test: to get the most booked", () => {
  let testUser;
  beforeEach(async () => {
    let testUser = new UsersDetails({
      username: "testuser",
      email: "testuser123@gmail.com",
      password: "Password@123",
      role: "admin",
    });

    await testUser.save();

    const payload = { id: testUser._id, role: testUser.role };
    let token = jwt.sign(payload, process.env.SEC);

    let testLog = new Logs({
      UserId: testUser._id,
      logintime: Date.now(),
      UserToken: token,
    });

    await testLog.save();
  });

  it("should respond with the 200 to get events for most booked", async () => {
    let testEvent = new Event({
      eventname: "testevent",
      eventdate: "2025-07-15",
      eventlocation: "amc",
      amountrange: 100,
      eventtime: "18:30:00",
      totalseats: 200,
      availableseats: 20,
      bookedseats: 180,
      userId: "67d27648560c7a46081d1e5b",
    });

    await testEvent.save();

    const response = await request(app).get("/general/mostbookings");

    expect(response.statusCode).toBe(200);
  });

  it("should respond with the 500 handle errors in catch block", async () => {
    const originalFind = Event.find;
    Event.find = () => {
      throw new Error("Simulated Database Error");
    };

    const response = await request(app).get("/general/mostbookings");

    expect(response.statusCode).toBe(500);
    Event.find = originalFind;
  });
});

describe("integration Test: to get the events based on the path", () => {
  it("should respond with the 200 status code in path", async () => {
    Event.find = async () => {
      return [
        {
          _id: "60f7b2c8e9f3c20017045a2c",
          eventname: "hole",
          eventdate: "2025-07-15",
          eventlocation: "amc",
          amountrange: 100,
          eventtime: "18:30:00",
          totalseats: 200,
          availableseats: 180,
          bookedseats: 20,
          userId: "60f7b2c8e9f3c20017045a2d",
          __v: 0,
        },
      ];
    };

    const response = await request(app).get("/general/path/holi/amc/100");

    expect(response.statusCode).toBe(200);
  });

  it("should respond with the  404 status code when no events are found in path", async () => {
    Event.find = async () => {
      return [];
    };

    const response = await request(app).get("/general/path/eventname/amc/100");

    expect(response.statusCode).toBe(404);
  });

  it("should respond with the 500 to handle errors in catch block for the path", async () => {
    Event.find = () => {
      throw new Error("Database Error");
    };

    const response = await request(app).get("/general/path/eventname/amc/100");

    expect(response.statusCode).toBe(500);
  });
});

describe("integration Test: to get the events based on the query", () => {
  jest.mock("../../models/EventsDetails.js");

  it("should responds with the 200 status code when  events are found for query", async () => {
    Event.find = async () => {
      return [
        {
          _id: "60f7b2c8e9f3c20017045a2c",
          eventname: "holi",
          eventdate: "2025-07-15",
          eventlocation: "amc",
          amountrange: 100,
          eventtime: "18:30:00",
          totalseats: 100,
          availableseats: 80,
          bookedseats: 20,
          userId: "60f7b2c8e9f3c20017045a2d",
          __v: 0,
        },
      ];
    };

    const response = await request(app).get(
      "/general/query?eventlocation=amc&eventname=holi&amountrange=150&totalseats=100"
    );

    expect(response.statusCode).toBe(200);
  });

  it("should responds with the 404 status code when no events are found for query", async () => {
    Event.find = async () => {
      return [];
    };

    const response = await request(app).get(
      "/general/query?eventlocation=amcy"
    );

    expect(response.statusCode).toBe(404);
  });

  it("should responds with the 500 to handle error in cathch block for query", async () => {
    const originalFind = Event.find;
    Event.find = () => {
      throw new Error("new error");
    };

    const response = await request(app).get("/general/query?eventlocation=amc");
    expect(response.statusCode).toBe(500);

    Event.find = originalFind;
  });
});
