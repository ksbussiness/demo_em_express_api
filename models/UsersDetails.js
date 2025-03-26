import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    //enum:['user','admin'],
    default: "user",
    required: true,
  },
});

//hashing the password
userSchema.pre("save", async function (done) {

  if (!this.isModified("password")) {
    console.log("Password is not modified, skipping hashing...");
    return done();
  }
  this.password = await bcrypt.hash(this.password, 10);
  this.increment();
  done();
});

//module.exports=mongoose.model('User',userSchema);
export default mongoose.model("UsersDetails", userSchema);
