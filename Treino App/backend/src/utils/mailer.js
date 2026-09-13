const nodemailer = require("nodemailer");

function getTransport() {
  if (!process.env.SMTP_HOST) return null; // não configurado ainda — não quebra o fluxo
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function notifyAdminNewLead(lead) {
  const transport = getTransport();
  if (!transport) {
    console.log("[mailer] SMTP não configurado — pulando envio de email de lead.");
    return;
  }

  await transport.sendMail({
    from: `"Lucas Falco Training" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_NOTIFICATION_EMAIL,
    subject: "NOVO CLIENTE INTERESSADO",
    text: [
      `Nome: ${lead.name}`,
      `Telefone: ${lead.whatsapp}`,
      `Objetivo: ${lead.objective || "-"}`,
      `Idade: ${lead.age || "-"}`,
      `Gênero: ${lead.gender || "-"}`,
      `Altura: ${lead.heightCm || "-"}`,
      `Peso: ${lead.weightKg || "-"}`,
      `Origem: ${lead.origin}`,
      `Observações: ${lead.notes || "-"}`,
    ].join("\n"),
  });
}

async function notifyAdminFoodRequest(request) {
  const transport = getTransport();
  if (!transport) return;

  await transport.sendMail({
    from: `"Lucas Falco Training" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_NOTIFICATION_EMAIL,
    subject: "Nova solicitação de alimento",
    text: `Aluno solicitou cadastro do alimento: ${request.name} (${request.brand || "sem marca"})`,
  });
}

async function sendSubscriptionReminder(sub){
  const transport=getTransport(); if(!transport || !sub.student?.user?.email) return false;
  await transport.sendMail({from:`"Lucas Falco Training" <${process.env.SMTP_USER}>`,to:sub.student.user.email,subject:"Sua assinatura está perto de vencer",text:`Olá, ${sub.student.name}! Sua assinatura do plano ${sub.plan.name} vence em ${new Date(sub.renewsAt).toLocaleDateString("pt-BR")}. Fale com Lucas para renovar.`});
  return true;
}
module.exports = { notifyAdminNewLead, notifyAdminFoodRequest, sendSubscriptionReminder };
