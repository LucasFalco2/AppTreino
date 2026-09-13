const prisma = require("../config/db");

async function listMyNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const current = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ error: "Notificação não encontrada." });
    if (current.userId !== req.user.userId) return res.status(403).json({ error: "Acesso negado." });
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

module.exports = { listMyNotifications, markAsRead };
