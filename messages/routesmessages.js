const authroutes = {
  //messages for the registration:
  registartionA: "Missing required fields in the body",
  registartionB:
    "Validation failed body requirement not matching has per the requirements",

  //messages for the passwordupdation:
  passwordupdationA:
    "Validation failed Body not matching the requirements check them once while updating the password",

  //messages for the login
  loginmessagesA: "Missing required fields in the body",
  loginmessagesB: "Validation failed body requirement not matching",

  //messages for the logout:
  logoutmessagesA: "Validation failed in the header requirement not matching",
};

const bookingroutes = {
  //messages for the location providing
  locationA:
    "The authorization header is required, to provide the location of the user",
  locationB:
    "The body is not matching has per  requirements, to provide the location of the user",

  //messages for the eventsforlocation
  eventsforlocationA:
    "The authorization header is required, to get the events of the for the particular location",

  //messages for the eventboooking

  bookingeventA:
    "The authorization header is required, while booking the no of seats for the event",
  bookingeventB:
    "The  body is missing the required format while booking the event",

  // messages for the getallbookings

  getallbookingsA:
    "The authorization header is required, to get the all of  bookings for this user",

  //messages for updating the no of seats
  updateNoOfseatsA:
    "The authorization header is required, while updating the bookings of  the no of seats for the event",
  updateNoOfseatsB:
    "The Body is not Matching has per the requirements, give correct body for updation",
  updateNoOfseatsC:
    "The params is not Matching has per the requirements, give correct params id for updation",

  //messages for cancelling the event booking
  canceleventbookingA:
    "The authorization header is required, while cancelling the event booking",
  canceleventbookingB:
    "The params is not Matching has per the requirements, give correct params id for cancelling the event booking",
};

const eventroutes = {
  //messages for the event creation
  createeventA:
    "Validation failed in the header ,requirement not matching correctly",
  createeventB: "Missing required fields in the body when creating an event",
  createeventC:
    "Validation failed body requirement not matching when creating an event",

  //messages for getting all events
  getalleventsA:
    "The authorization header is required, to get the events of the particular event manager",

  //messages for getting the event by id
  geteventbyidA:
    "The authorization header is required, to get the events of the particular event manager based on the id",
  geteventbyidB: 'params.id should match pattern "^[0-9a-fA-F]{24}$"',

  //messages for updating the event
  updateeventA:
    "The authorization header is required, to update the events of the particular event manager",
  updateeventB:
    "The id is required, to update the events of the particular event manager",
  updateeventC:
    "The body is not matching has per  requirements, to update the events of the particular event manager",

  //messages for deleting the event
  deleteeventA:
    "The authorization header is required, to delete the events of the particular event manager",
  deleteeventB:
    "The id is required, to delete the events of the particular event manager",
};

const generalroutes = {};

export const routesmessages = {
  authroutes,
  bookingroutes,
  eventroutes,
  generalroutes,
};
