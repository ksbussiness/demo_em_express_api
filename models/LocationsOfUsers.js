import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const EventLocSchema = new mongoose.Schema(
  {
    eventneedlocation: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: " UsersDetails",
      required: true,
    },
  },
  {
    timestamps: true,

    //userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
  }
);

//module.exports=mongoose.model('EventLoc',EventLocSchema);
export default mongoose.model("LocationsOfUsers", EventLocSchema);
