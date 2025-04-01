const mongoose = require("mongoose");

const CommentaireSchema = new mongoose.Schema({
  id_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Référence vers User
  contenu: { type: String, required: true },
  date_publication: { type: Date, default: Date.now },
  format: { type: String, enum: ["texte", "image", "vidéo"], required: true },
  sous_commentaires: [{ type: mongoose.Schema.Types.ObjectId, ref: "SousCommentaire" }] // Référence aux sous-commentaires
});

module.exports = mongoose.model("Commentaire", CommentaireSchema);
