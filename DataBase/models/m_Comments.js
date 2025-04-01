const mongoose = require("mongoose");

const SousCommentaireSchema = new mongoose.Schema({
  id_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Référence vers User
  id_commentaire: { type: mongoose.Schema.Types.ObjectId, ref: "Commentaire", required: true }, // Référence vers le commentaire parent
  contenu: { type: String, required: true },
  date_publication: { type: Date, default: Date.now },
  format: { type: String, enum: ["texte", "image", "vidéo"], required: true }
});

module.exports = mongoose.model("SousCommentaire", SousCommentaireSchema);

