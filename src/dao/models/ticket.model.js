import mongoose from "mongoose";

const ticketCollection = "tickets";

const ticketSchema = new mongoose.Schema({
  code: String,
  purchase_datetime: Date,
  amount: Number,
  purchaser: String,
  password: String,
  role: {
    type: mongoose.Types.ObjectId,
    ref: "users",
  },
});

const ticketModel = mongoose.model(ticketCollection, ticketSchema);

export default ticketModel;
