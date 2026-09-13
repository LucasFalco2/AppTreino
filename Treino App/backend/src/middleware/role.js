// Uso: router.get("/admin/x", requireAuth, requireRole("ADMIN"), handler)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acesso não autorizado para este perfil." });
    }
    next();
  };
}

// Garante que um STUDENT só acesse/edite os próprios dados.
// Compara req.user.studentId com :studentId da rota (ou studentId do body).
function requireOwnStudentOrAdmin(req, res, next) {
  if (req.user.role === "ADMIN") return next();

  const targetId = req.params.studentId || req.body.studentId;
  if (req.user.role === "STUDENT" && req.user.studentId === targetId) {
    return next();
  }
  return res.status(403).json({ error: "Você não pode acessar dados de outro aluno." });
}

module.exports = { requireRole, requireOwnStudentOrAdmin };
