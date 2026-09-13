const router = require("express").Router();
const { createLead } = require("../controllers/leads.controller");

// Rota pública — página "Quero saber mais"
router.post("/", createLead);

module.exports = router;
