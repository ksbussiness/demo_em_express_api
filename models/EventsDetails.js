import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const eventSchema = new mongoose.Schema({
  amountrange: {
    type: Number,
  },
  eventname: {
    type: String,
    required: true,
  },
  eventdate: {
    type: Date,
    required: true,
  },
  eventlocation: {
    type: String,
    required: true,
  },
  eventtime: {
    type: String,
    required: true,
  },

  totalseats: {
    type: Number,
    required: true,
  },
  availableseats: {
    type: Number,
    required: true,
  },
  bookedseats: {
    type: Number,
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UsersDetails",
    required: true,
  },
});

//module.exports=mongoose.model('Event',eventSchema)
export default mongoose.model("Event", eventSchema);
