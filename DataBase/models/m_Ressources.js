const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  mail: String,
  password: String, // À hasher avant l'insertion
  username: String,
  genre: String
});

module.exports = mongoose.model("User", UserSchema);
