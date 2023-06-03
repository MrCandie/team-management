const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "team must have a name"],
    },
    members: {
      type: Array,
    },
    userId: {
      type: String,
      required: [true, "team must belong to a user"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Team", teamSchema);
