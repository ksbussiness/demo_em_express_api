import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const LogSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: " UsersDetails",
    required: true,
  },

  logintime: {
    type: Date,
    default: Date.now,
    required: true,
  },

  logouttime: {
    type: Date,
    default: null,
    required: false,
  },

  UserToken: {
    type: String,
    default: null,
    //required:true
  },
});

export default mongoose.model("Logs", LogSchema);
