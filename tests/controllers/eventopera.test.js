import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Event from "../../models/EventsDetails.js";
import Logs from "../../models/LoginLogoutDetails";
import UsersDetails from "../../models/UsersDetails.js";

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await app.listen(3074);

  await UsersDetails.deleteMany();
  await Logs.deleteMany();
  await Event.deleteMany();
});

afterAll(async () => {
  // await UsersDetails.deleteMany();
  await Event.deleteMany();
  await Logs.deleteMany();
  await app.close();
  await mongoose.disconnect();
});

let token;

beforeEach(async () => {
  let testUser = new UsersDetails({
    username: "testuser",
    email: "testuser123@gmail.com",
    password: "Password@123",
    role: "admin",
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

describe("Integration Tests: Cases for the event creation:", () => {
  var event1 = {
    eventname: "event1",
    eventdate: "2027-12-12",
    eventlocation: "hyderabad",
    amountrange: 100,
    eventtime: "10:00:00",
    totalseats: 100,
    availableseats: 100,
    bookedseats: 0,
  };
  it("shoul responds with the 200 status code for valid data", async () => {
    const response = await request(app)
      .post(`/event/create`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(200);
  });

  it("shoul responds with the 405 status code for valid date", async () => {
    var event1 = {
      eventname: "event1",
      eventdate: "2022-12-12",
      eventlocation: "hyderabad",
      amountrange: 100,
      eventtime: "10:00:00",
      totalseats: 100,
      availableseats: 100,
      bookedseats: 0,
    };

    const response = await request(app)
      .post(`/event/create`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(405);
  });

  it("shoul responds with the 404 status code for body validation", async () => {
    var event1 = {
      eventname: "event1",
      eventdate: "2044-12-12",
      eventlocation: "hyderabad",
      amountrange: 100,
      eventtime: "10:00",
      totalseats: 100,
      availableseats: 100,
      bookedseats: 0,
    };

    const response = await request(app)
      .post(`/event/create`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(404);
  });

  it("shoul responds with the 403 status code for body missing parameters", async () => {
    var event1 = {
      eventdate: "2044-12-12",
      eventlocation: "hyderabad",
      amountrange: 100,
      eventtime: "10:00:00",
      totalseats: 100,
      availableseats: 100,
      bookedseats: 0,
    };

    const response = await request(app)
      .post(`/event/create`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(403);
  });

  it("shoul responds with the 400 status code for header invalidation", async () => {
    const response = await request(app)
      .post(`/event/create`)
      .set("Authorization", `Bearer ${token.kjhud}`)
      .send(event1);

    expect(response.statusCode).toBe(400);
  });

  it("shoul responds with the 500 status code for server error", async () => {
    jest.spyOn(Event.prototype, "save").mockImplementationOnce(() => {
      throw new Error("Simulated Server Error");
    });

    const response = await request(app)
      .post(`/event/create`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(500);

    Event.prototype.save.mockRestore();
  });
});

describe("Integration Tests: Cases for the event getting:", () => {
  it("should responds with the 400 status code for invalid header", async () => {
    const response = await request(app)
      .get(`/event/get`)
      .set("Authorization", `Bearer ${token.kughig}`);

    expect(response.statusCode).toBe(400);
  });

  it("should responds with the 500 status code for server error", async () => {
    jest.spyOn(Event, "find").mockImplementationOnce(() => {
      throw new Error("Simulated Server Error");
    });

    const response = await request(app)
      .get(`/event/get`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(500);

    Event.find.mockRestore();
  });

  it("should responds with the 200 status code for valid data", async () => {
    const response = await request(app)
      .get(`/event/get`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
  });
});

describe("Integration Tests: Cases for the event getting by id:", () => {
  it("should responds with the 400 status code for invalid header", async () => {
    const response = await request(app)
      .get("/event/get/67da928585cb94f749efdd0e")
      .set("Authorization", `Bearer ${token.hgsj}`);

    expect(response.statusCode).toBe(400);
  });

  it("should responds with the 401 status code for invalid params", async () => {
    const response = await request(app)
      .get("/event/get/67daf749efdd0e")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(401);
  });

  it("should responds with the 404 status code for event not found", async () => {
    const response = await request(app)
      .get("/event/get/67da928585cb94f749efdd0e")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
  });

  it("should respond with the 200 status code  for a valid ID", async () => {
    const decodedToken = jwt.verify(token, process.env.SEC);

    const mockEvent = {
      _id: "507f191e810c19729de860ea",
      eventname: "holi",
      eventdate: "2056-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 100,
      bookedseats: 0,
      userId: decodedToken.id,
    };

    jest.spyOn(Event, "findById").mockResolvedValueOnce(mockEvent);

    const response = await request(app)
      .get(`/event/get/${mockEvent._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    Event.findById.mockRestore();
  });

  it("should responds with the 500 status code for server error", async () => {
    jest.spyOn(Event, "findById").mockImplementationOnce(() => {
      throw new Error("Simulated Server Error");
    });

    const response = await request(app)
      .get(`/event/get/67da928585cb94f749efdd0e`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(500);

    Event.findById.mockRestore();
  });
});

describe("Integration Tests: Cases for the event updating by id:", () => {
  var event1 = {
    eventname: "event1",
    eventdate: "2027-12-12",
    eventlocation: "hyderabad",
    amountrange: 100,
    eventtime: "10:00:00",
  };

  it("should responds with the 400 status code for invalid header", async () => {
    const response = await request(app)
      .put("/event/update/67da928585cb94f749efdd0e")
      .set("Authorization", `Bearer ${token.jgsd}`)
      .send(event1);

    expect(response.statusCode).toBe(400);
  });

  it("should responds with the 403 status code for invalid params", async () => {
    const response = await request(app)
      .put("/event/update/67da928fdd0e")
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(403);
  });

  it("should responds with the 410 status code for invalid body validation", async () => {
    var event1 = {
      eventname: "event1",
      eventdate: "2027-12-12",
      eventlocation: "hyderabad",
      amountrange: 100,
      eventtime: "10:00",
    };

    const response = await request(app)
      .put("/event/update/67da90cb16a65f2a28d2b88e")
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(410);
  });

  it("should responds with the 405 status code for invalid date", async () => {
    var event1 = {
      eventname: "event1",
      eventdate: "2022-12-12",
      eventlocation: "hyderabad",
      amountrange: 100,
      eventtime: "10:00:00",
    };

    const response = await request(app)
      .put(`/event/update/67da90cb16a65f2a28d2b88e`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(405);
  });

  it("should responds with the 404 status code for event not found", async () => {
    var event1 = {
      eventname: "event1",
      eventdate: "2047-12-12",
      eventlocation: "hyderabad",
      amountrange: 100,
      eventtime: "10:00:00",
    };

    const response = await request(app)
      .put(`/event/update/67da90cb16a65f2a28d2b88e`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(404);
  });

  it("should responds with the 200 status code for event updation", async () => {
    const decodedToken = jwt.verify(token, process.env.SEC);

    const mockEvent = {
      _id: "507f191e810c19729de860ea",
      eventname: "holi",
      eventdate: "2056-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 100,
      bookedseats: 0,
      userId: decodedToken.id,
    };

    let event1 = {
      eventname: "event1",
      eventdate: "2047-02-02",
      eventlocation: "hyderabad",
      amountrange: 100,
      eventtime: "10:00:00",
    };

    jest.spyOn(Event, "findById").mockResolvedValueOnce(mockEvent);

    jest.spyOn(Event, "findByIdAndUpdate").mockResolvedValueOnce({
      ...mockEvent,
      ...event1,
    });

    const response = await request(app)
      .put(`/event/update/${mockEvent._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(200);

    Event.findById.mockRestore();
  });

  it("should respond with 400 if the event fails to update", async () => {
    const decodedToken = jwt.verify(token, process.env.SEC);

    const mockEvent = {
      _id: "507f191e810c19729de860ea",
      eventname: "holi",
      eventdate: "2056-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 100,
      bookedseats: 0,
      userId: decodedToken.id,
    };

    let event1 = {
      eventname: "event1",
      eventdate: "2047-02-02",
      eventlocation: "hyderabad",
      amountrange: 100,
      eventtime: "10:00:00",
    };

    jest.spyOn(Event, "findById").mockResolvedValueOnce(mockEvent);

    jest.spyOn(Event, "findByIdAndUpdate").mockResolvedValueOnce(null);

    let payload = {
      eventname: "Updated Event",
      eventdate: "2045-12-12",
      eventlocation: "Updated Location",
      amountrange: 300,
      eventtime: "14:00:00",
    };

    const response = await request(app)
      .put(`/event/update/${mockEvent._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.statusCode).toBe(400);

    Event.findByIdAndUpdate.mockRestore();
  });

  it("should responds with the 500 status code for server error", async () => {
    var event1 = {
      eventname: "event1",
      eventdate: "2047-12-12",
      eventlocation: "hyderabad",
      amountrange: 100,
      eventtime: "10:00:00",
    };

    jest.spyOn(Event, "findById").mockImplementationOnce(() => {
      throw new Error("Simulated Server Error");
    });

    const response = await request(app)
      .put(`/event/update/67da928585cb94f749efdd0e`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(500);

    Event.findById.mockRestore();
  });
});

describe("Integration Tests: Cases for the event deletion by id:", () => {
  it("should responds with the 400 status code for invalid header", async () => {
    const response = await request(app)
      .delete(`/event/delete/67da928585cb94f749efdd0e`)
      .set("Authorization", `Bearer ${token.kjhd}`);

    expect(response.statusCode).toBe(400);
  });

  it("should responds with the 405 status code for invalid params id", async () => {
    const response = await request(app)
      .delete(`/event/delete/67da9dd0e`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(405);
  });

  it("should responds with the 404 status code for event not found", async () => {
    const response = await request(app)
      .delete(`/event/delete/67da928585cb94f749efdd0e`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
  });

  it("should responds with the 200 status code for event deletion", async () => {
    const decodedToken = jwt.verify(token, process.env.SEC);

    const mockEvent = {
      _id: "507f191e810c19729de860ea",
      eventname: "holi",
      eventdate: "2056-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 100,
      bookedseats: 0,
      userId: decodedToken.id,
    };

    jest.spyOn(Event, "findByIdAndDelete").mockResolvedValueOnce(mockEvent);

    const response = await request(app)
      .delete(`/event/delete/${mockEvent._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    Event.findByIdAndDelete.mockRestore();
  });

  it("should responds with the 500 status code for server error", async () => {
    jest.spyOn(Event, "findByIdAndDelete").mockImplementationOnce(() => {
      throw new Error("Simulated Server Error");
    });

    const response = await request(app)
      .delete(`/event/delete/67da928585cb94f749efdd0e`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(500);

    Event.findByIdAndDelete.mockRestore();
  });
});
