const { PrismaClient } = require("@prisma/client");

// Singleton do Prisma Client (evita múltiplas conexões em dev com nodemon)
const prisma = global.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

module.exports = prisma;
