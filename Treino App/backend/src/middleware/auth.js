const { verifyToken } = require("../utils/jwt");
const prisma = require("../config/db");

// Extrai o token do cookie HttpOnly "token" ou do header Authorization: Bearer
async function requireAuth(req, res, next) {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  const token = req.cookies?.token || bearer;

  if (!token) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  try {
    const payload = verifyToken(token);
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { student: true, admin: true },
    });
    if (!currentUser || !currentUser.isActive) {
      return res.status(401).json({ error: "Conta inexistente ou desativada." });
    }
    req.user = {
      ...payload,
      role: currentUser.role,
      studentId: currentUser.student?.id,
      adminId: currentUser.admin?.id,
    };
    if (payload.role === "STUDENT" && payload.studentId) {
      const sub = await prisma.subscription.findFirst({ where:{studentId:payload.studentId,status:"ACTIVE"}, orderBy:{renewsAt:"desc"} });
      if (sub?.renewsAt && Date.now() > new Date(sub.renewsAt).getTime() + 5*86400000) {
        await prisma.subscription.update({where:{id:sub.id},data:{status:"EXPIRED"}});
        await prisma.user.update({where:{id:payload.userId},data:{isActive:false}});
        return res.status(403).json({error:"Sua assinatura expirou. Fale com o Lucas para renovar."});
      }
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }
}

module.exports = { requireAuth };
