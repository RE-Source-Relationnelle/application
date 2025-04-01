const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/ton_nom_de_bdd", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Erreur de connexion à MongoDB:"));
db.once("open", () => {
  console.log("Connexion réussie à MongoDB");
});

module.exports = db;
