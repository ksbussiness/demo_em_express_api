

const authoperations={

    // messages for the registration
    resA:"Username already exists. Try with another username",
    resB:"user created successfully",
    resC:"error creating the user",

    //messages for the otp generation
    otpA:"User not found ! Please enter a valid username,if you are a new user please register first",
    otpB:"OTP sent successfully To your provided Email-id",
    otpC:"Internal Server Error while while executing the optGeneration",

    //messages for the passwordupdation
    passA:"User not found ! Please enter a valid username,if you are a new user please register first",
    passB:"Invalid OTP! please enter the valid OTP",
    passC:"OTP Verified! Password updated successfully",
    passD:"Error while updating the password",

    //messages for the login
    loginA:"user not found",
    loginB:"invalid credentials",
    loginC:"Error while logging in the user",

    //messages for the logout
    logoutA:"No active session found for this token",
    logoutB:"user logged out successfully",
    logoutC:"error while logout of the current-user",


};

const bookingscontoller={

    //messages for the location providing
    locationA:"location saved for this user",
    locationB:"getting the error while giving the event location",

    //messages for getting the events based on the location
    eventlocationA:"Please provide your location first.",
    eventlocationB:"No events found for this location",
    eventlocationC:"Server error while retrieving events.",

    //messages for event booking
    eventbookingA:"event is fully booked",
    eventbookingB:"Server error while booking the event.",

    //messages for getting all bookings 
    getbookingA:"Server error while retrieving all bookings",

    //messages for updating the booking
    updatebookingsA:'event not found for the given params id while updation',
    updatebookingsB:"you are given same number of seats,so no changes in your booking",
    updatebookingsC:"Server error while updating the booking.",

    //messages for deleting the booking
    deletebookingsA:"bookings not found",
    deletebookingsB:'event booking cancelled successfully' ,
    deletebookingsC:"Server error while deleting the booking.",

}


const eventoperations={


    // messages for the eventcreation
    eventcreationA:'Database save failed,Error creating the Event',

    //messages for the getting the events
    gettingeventsA:'Database failed while getting the events data',

    //messages for get event by id
    geteventbyidA:"event not found",
    geteventbyidB:'Internal Server Error while while executing the getbyId',

    //messages for the update event 
    updatebyidA:'Event date must be in the future.',
    updatebyidB:'event not found',
    updatebyidC: 'Event updating failed !This is what i found',
    updatebyidD:"Internal Server Error while updating the event",

    //messages for the delete event
    deleteeventA:'event not found',
    deleteeventB:'event deleted successfully',
    deleteeventC:'Internal Server Error while deleting the event',


};


const generaloperations={

    //messages for the getallevents:
    getalleventsA:"Events model is empty",
    getalleventsB: "Server error while retrieving all events from Events Model",

    //messages for the most bokkings:
    mostbookings:"Server error while retrieving most booked events",

    //messages for the query parameters:
    queryA:"No events found",
    queryB:"Server error for the demo rouet",

    //messages for the path parameters
    pathA:"No events found",
    pathB:"Server error for the demo path route"

};



export const controllermessages={
    authoperations,
    bookingscontoller,
    eventoperations,
    generaloperations

}