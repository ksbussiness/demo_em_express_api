import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Event from "../../models/EventsDetails.js";
import Logs from "../../models/LoginLogoutDetails";
import UsersDetails from "../../models/UsersDetails.js";
import LocationsOfUsers from "../../models/LocationsOfUsers.js";
import EventBookingsDetails from "../../models/EventBookingsDetails.js";

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await app.listen(3084);

  // Clean up any existing data from previous tests
  await UsersDetails.deleteMany();
  await Logs.deleteMany();
  await Event.deleteMany();
  await LocationsOfUsers.deleteMany();
  await EventBookingsDetails.deleteMany();
});

afterAll(async () => {
  await Event.deleteMany();
  await Logs.deleteMany();
  await LocationsOfUsers.deleteMany();
  await EventBookingsDetails.deleteMany();
  await app.close();
  await mongoose.disconnect();
});

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

describe("Integration Tests: Cases for the location giving :", () => {
  var event1 = {
    eventneedlocation: "event1",
  };

  it("should responds with the 400 status code for invalid header", async () => {
    const response = await request(app)
      .post("/booking/location")
      .set("Authorization", `Bearer ${token.hgsj}`)
      .send(event1);

    expect(response.statusCode).toBe(400);
  });

  it("should responds with the 405 status code for invalid body", async () => {
    var event1 = {
      eventneedlocation: "1",
    };

    const response = await request(app)
      .post("/booking/location")
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(405);
  });

  it("should responds with the 200 status code for valid data", async () => {
    const response = await request(app)
      .post("/booking/location")
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(200);
  });

  it("should responds with the 500 status code for server error", async () => {
    jest
      .spyOn(LocationsOfUsers.prototype, "save")
      .mockImplementationOnce(() => {
        throw new Error("Simulated Server Error");
      });

    const response = await request(app)
      .post("/booking/location")
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(500);
    LocationsOfUsers.prototype.save.mockRestore();
  });
});

describe("Integration Tests: Cases for the getting events for location :", () => {
  it("should responds with the 400 status code for invalid headers", async () => {
    const response = await request(app)
      .get("/booking/eventsforlocation")
      .set("Authorization", `Bearer ${token.hgsj}`);

    expect(response.statusCode).toBe(400);
  });

  it("should responds with the 404 status code for location not found  for user", async () => {
    const response = await request(app)
      .get("/booking/eventsforlocation")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
  });

  it("should respond with the 405 status code when no events are found for the given location", async () => {
    const decodedToken = jwt.verify(token, process.env.SEC);

    const userLocation = new LocationsOfUsers({
      userId: decodedToken.id,
      eventneedlocation: "nonexistentlocation",
    });

    await userLocation.save();

    const response = await request(app)
      .get("/booking/eventsforlocation")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(405);
  });

  it("should respond with the 200 status code when  events are found for the given location", async () => {
    const decodedToken = jwt.verify(token, process.env.SEC);

    const userLocation = new LocationsOfUsers({
      userId: decodedToken.id,
      eventneedlocation: "amc",
    });

    await userLocation.save();

    const event1 = new Event({
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 80,
      bookedseats: 20,
      userId: decodedToken.id,
    });

    await event1.save();

    const response = await request(app)
      .get("/booking/eventsforlocation")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
  });

  it("should responds with the 500 status code for server error", async () => {
    jest.spyOn(LocationsOfUsers, "findOne").mockImplementationOnce(() => {
      throw new Error("Simulated Server Error");
    });

    const response = await request(app)
      .get("/booking/eventsforlocation")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(500);
    LocationsOfUsers.findOne.mockRestore();
  });
});

describe("Integration Tests: Cases for the event booking:", () => {
  var event1 = {
    NoOfSeatsBooking: 2,
  };

  it("should responds with the 400 status code for invalid headers", async () => {
    const response = await request(app)
      .post("/booking/eventit/607f191e810c19729de860ea")
      .set("Authorization", `Bearer ${token.hgsj}`)
      .send(event1);

    expect(response.statusCode).toBe(400);
  });

  it("should responds with the 405 status code for BODY INVALID", async () => {
    var event1 = {
      NoOfSeatsBooking: 0,
    };

    const response = await request(app)
      .post("/booking/eventit/607f191e810c19729de860ea")
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(405);
  });

  it("should responds with the 408 status code for zero available  seats", async () => {
    var event2 = {
      NoOfSeatsBooking: 2,
    };

    const decodedToken = jwt.verify(token, process.env.SEC);

    const userLocation = new LocationsOfUsers({
      userId: decodedToken.id,
      eventneedlocation: "amc",
    });

    await userLocation.save();

    const event1 = new Event({
      _id: "507f191e810c19729de860ea",
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 0,
      bookedseats: 100,
      userId: decodedToken.id,
    });

    await event1.save();

    const response = await request(app)
      .post(`/booking/eventit/${event1._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(event2);

    expect(response.statusCode).toBe(408);
  });

  it("should responds with the 410 status code for exceeding available seats", async () => {
    var event2 = {
      NoOfSeatsBooking: 25,
    };

    const decodedToken = jwt.verify(token, process.env.SEC);

    const userLocation = new LocationsOfUsers({
      userId: decodedToken.id,
      eventneedlocation: "amc",
    });

    await userLocation.save();

    const event1 = new Event({
      _id: "67d949d9354f6dad3be11f1e",
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 10,
      bookedseats: 90,
      userId: decodedToken.id,
    });

    await event1.save();

    const response = await request(app)
      .post(`/booking/eventit/${event1._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(event2);

    expect(response.statusCode).toBe(410);
  });

  it("should responds with the 200 status code for booking event with in  available seats", async () => {
    var event2 = {
      NoOfSeatsBooking: 20,
    };

    const decodedToken = jwt.verify(token, process.env.SEC);

    const userLocation = new LocationsOfUsers({
      userId: decodedToken.id,
      eventneedlocation: "amc",
    });

    await userLocation.save();

    const event1 = new Event({
      _id: "68d949d9354f6dad3be11f1e",
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 70,
      bookedseats: 30,
      userId: decodedToken.id,
    });

    await event1.save();

    const response = await request(app)
      .post(`/booking/eventit/${event1._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(event2);

    expect(response.statusCode).toBe(200);
  });

  it("should responds with the 500 status code for server error ", async () => {
    var event1 = {
      NoOfSeatsBooking: 10,
    };

    jest.spyOn(Event, "findById").mockImplementationOnce(() => {
      throw new Error("Simulated Server Error");
    });

    const response = await request(app)
      .post(`/booking/eventit/607f191e810c19729de860a`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(500);
    Event.findById.mockRestore();
  });
});

describe("Integration Tests: Cases for the getting all event-bookings:", () => {
  it("should responds with the 400 status code for invalid headers", async () => {
    const response = await request(app)
      .get(`/booking/all`)
      .set("Authorization", `Bearer ${token.jhbf}`);

    expect(response.statusCode).toBe(400);
  });

  it("should responds with the 200 status code for valid headers and getting bookings", async () => {
    const response = await request(app)
      .get(`/booking/all`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
  });

  it("should responds with the 500 status code for server error", async () => {
    jest.spyOn(EventBookingsDetails, "find").mockImplementationOnce(() => {
      throw new Error("Simulated Server Error");
    });

    const response = await request(app)
      .get(`/booking/all`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(500);
    EventBookingsDetails.find.mockRestore();
  });
});

describe("Integration Tests: Cases for the updating event-bookings:", () => {
  var event1 = {
    NoOfSeatsBooking: 2,
  };

  it("should responds with the 400 status code for invalid headers", async () => {
    const response = await request(app)
      .put(`/booking/bookings/607f191e810c19729de860ea`)
      .set("Authorization", `Bearer ${token.tbgf}`)
      .send(event1);

    expect(response.statusCode).toBe(400);
  });

  it("should responds with the 500 status code for server error", async () => {
    jest
      .spyOn(EventBookingsDetails, "findByIdAndUpdate")
      .mockImplementationOnce(() => {
        throw new Error("Simulated Server Error");
      });

    const response = await request(app)
      .put(`/booking/bookings/607f191e810c19729de860ea`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(500);

    EventBookingsDetails.findByIdAndUpdate.mockRestore();
  });

  it("should responds with the 405 status code for body invalid", async () => {
    var event1 = { NoOfSeatsBooking: 0 };

    const response = await request(app)
      .put(`/booking/bookings/607f191e810c19729de860ea`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(405);
  });

  it("should responds with the 408 status code for params  invalid", async () => {
    const response = await request(app)
      .put(`/booking/bookings/f191e810c19729de860ea`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(408);
  });

  it("should responds with the 410 status code for bookings not found", async () => {
    const response = await request(app)
      .put(`/booking/bookings/607f191e810c19729de860ea`)
      .set("Authorization", `Bearer ${token}`)
      .send(event1);

    expect(response.statusCode).toBe(410);
  });

  it("should responds with the 415 status code for exceeding seats limit", async () => {
    var event2 = {
      NoOfSeatsBooking: 20,
    };

    const decodedToken = jwt.verify(token, process.env.SEC);

    const userLocation = new LocationsOfUsers({
      userId: decodedToken.id,
      eventneedlocation: "amc",
    });

    await userLocation.save();

    const event1 = new Event({
      _id: "679a61e495e3ea757f90448e",
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 1,
      bookedseats: 99,
      userId: "67d912ced02252ce85b237b2",
    });

    await event1.save();
    var event = new EventBookingsDetails({
      _id: "659a61e495e3ea757f90447e",
      eventid: "679a61e495e3ea757f90448e",
      eventManager: "John Doe",
      eventManagerEmail: "johndoe@example.com",
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      eventtime: "18:00:00",
      amountrange: 100,
      NoOfSeatsBooking: 2,
      eventBookedBy: "Alice Smith",
      email: "alicesmith@example.com",
      AmountNeedPay: 20,
      userId: decodedToken.id,
    });

    await event.save();

    const response = await request(app)
      .put(`/booking/bookings/659a61e495e3ea757f90447e`)
      .set("Authorization", `Bearer ${token}`)
      .send(event2);

    expect(response.statusCode).toBe(415);
  });

  it("should responds with the 208 status code for giving same seats ", async () => {
    var event2 = {
      NoOfSeatsBooking: 2,
    };

    const decodedToken = jwt.verify(token, process.env.SEC);

    const userLocation = new LocationsOfUsers({
      userId: decodedToken.id,
      eventneedlocation: "amc",
    });

    await userLocation.save();

    const event1 = new Event({
      _id: "699a61e495e3ea757f90448e",
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 10,
      bookedseats: 90,
      userId: "60d912ced02252ce85b237b2",
    });

    await event1.save();
    var event = new EventBookingsDetails({
      _id: "669a61e495e3ea757f90441e",
      eventid: "699a61e495e3ea757f90448e",
      eventManager: "John Doe",
      eventManagerEmail: "johndoe@example.com",
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      eventtime: "18:00:00",
      amountrange: 100,
      NoOfSeatsBooking: 2,
      eventBookedBy: "Alice Smith",
      email: "alicesmith@example.com",
      AmountNeedPay: 200,
      userId: decodedToken.id,
    });

    await event.save();

    const response = await request(app)
      .put(`/booking/bookings/669a61e495e3ea757f90441e`)
      .set("Authorization", `Bearer ${token}`)
      .send(event2);

    expect(response.statusCode).toBe(208);
  });

  it("should responds with the 200 status code for successfully updating  ", async () => {
    var event2 = {
      NoOfSeatsBooking: 2,
    };

    const decodedToken = jwt.verify(token, process.env.SEC);

    const userLocation = new LocationsOfUsers({
      userId: decodedToken.id,
      eventneedlocation: "amc",
    });

    await userLocation.save();

    const event1 = new Event({
      _id: "619a61e495e3ea757f90448e",
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 50,
      bookedseats: 50,
      userId: "60d912ced02252ce85b237b2",
    });

    await event1.save();
    var event = new EventBookingsDetails({
      _id: "629a61e495e3ea757f90441e",
      eventid: "619a61e495e3ea757f90448e",
      eventManager: "John Doe",
      eventManagerEmail: "johndoe@example.com",
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      eventtime: "18:00:00",
      amountrange: 100,
      NoOfSeatsBooking: 20,
      eventBookedBy: "Alice Smith",
      email: "alicesmith@example.com",
      AmountNeedPay: 2000,
      userId: decodedToken.id,
    });

    await event.save();

    const response = await request(app)
      .put(`/booking/bookings/629a61e495e3ea757f90441e`)
      .set("Authorization", `Bearer ${token}`)
      .send(event2);

    expect(response.statusCode).toBe(200);
  });
});

describe("Integration Tests: Cases for the deleting event-bookings:", () => {
  it("should responds with the 400 status code for invalid headers", async () => {
    const response = await request(app)
      .delete(`/booking/cc/629a61e495e3ea757f90441e`)
      .set("Authorization", `Bearer ${token.jgkjuh}`);

    expect(response.statusCode).toBe(400);
  });

  it("should responds with the 500 status code for server error", async () => {
    jest
      .spyOn(EventBookingsDetails, "findByIdAndDelete")
      .mockImplementationOnce(() => {
        throw new Error("Simulated Server Error");
      });

    const response = await request(app)
      .delete(`/booking/cc/629a61e495e3ea757f90441e`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(500);

    EventBookingsDetails.findByIdAndDelete.mockRestore();
  });

  it("should responds with the 405 status code for invalid params", async () => {
    const response = await request(app)
      .delete(`/booking/cc/629e3ea757f90441e`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(405);
  });

  it("should responds with the 408 status code for bookings not found", async () => {
    const response = await request(app)
      .delete(`/booking/cc/607f191e810c19729de860ea`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(408);
  });

  it("should responds with the 200 status code for successfully deleting  booking ", async () => {
    const decodedToken = jwt.verify(token, process.env.SEC);

    const userLocation = new LocationsOfUsers({
      userId: decodedToken.id,
      eventneedlocation: "amc",
    });

    await userLocation.save();

    const event1 = new Event({
      _id: "619a61e495e3ea757f90448b",
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      amountrange: "100",
      eventtime: "18:00:00",
      totalseats: 100,
      availableseats: 50,
      bookedseats: 50,
      userId: "60d912ced02252ce85b237b2",
    });

    await event1.save();
    var event = new EventBookingsDetails({
      _id: "629a61e495e3ea757f90441c",
      eventid: "619a61e495e3ea757f90448b",
      eventManager: "John Doe",
      eventManagerEmail: "johndoe@example.com",
      eventname: "Sample Event 1",
      eventdate: "2025-12-12",
      eventlocation: "amc",
      eventtime: "18:00:00",
      amountrange: 100,
      NoOfSeatsBooking: 20,
      eventBookedBy: "Alice Smith",
      email: "alicesmith@example.com",
      AmountNeedPay: 2000,
      userId: decodedToken.id,
    });

    await event.save();

    const response = await request(app)
      .delete(`/booking/cc/629a61e495e3ea757f90441c`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
  });
});
