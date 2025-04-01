const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  id_user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Clé étrangère
  access_token: String,
  expiration_access_token: Date,
  refresh_token: String,
  expiration_refresh_token: Date
});

module.exports = mongoose.model("Token", TokenSchema);

