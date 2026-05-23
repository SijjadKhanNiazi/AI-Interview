const mongoose = require("mongoose");

const tokenBlackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "token is required to added in blacklist"],
    },
  },
  {
    timestamps: true,
  },
);

const tokenBlackList = mongoose.model("blackListTokens", tokenBlackListSchema);
module.exports = tokenBlackList;
