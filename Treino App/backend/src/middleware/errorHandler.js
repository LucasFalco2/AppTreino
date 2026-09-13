// Middleware central de erros — nunca vaza stack trace/detalhes internos em produção
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";

  res.status(status).json({
    error: isProd && status === 500 ? "Erro interno do servidor." : err.message,
  });
}

module.exports = { errorHandler };
