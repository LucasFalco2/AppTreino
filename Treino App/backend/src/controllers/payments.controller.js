const { z } = require("zod");
const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const { makePix } = require("../utils/pix");
const { registerCouponUsage } = require("../utils/coupon");

const checkoutSchema = z.object({
  name: z.string().min(2), email: z.string().email(), phone: z.string().min(8),
  password: z.string().min(6), planId: z.string().uuid(), couponCode: z.string().optional()
});

async function createPayment(req,res,next){
  try {
    const data=checkoutSchema.parse(req.body);
    const plan=await prisma.plan.findUnique({where:{id:data.planId}});
    if(!plan) return res.status(404).json({error:"Plano não encontrado."});
    const existing=await prisma.user.findUnique({where:{email:data.email.toLowerCase()}});
    if(existing) return res.status(409).json({error:"Este email já possui uma conta. Entre pelo login."});
    let amount=plan.priceCents, coupon=null;
    if(data.couponCode){
      const {validateCoupon}=require("../utils/coupon");
      const result=await validateCoupon(data.couponCode,data.planId);
      if (!result.valid) return res.status(400).json({error: result.reason || "Cupom inválido."});
      coupon = result.coupon || await prisma.coupon.findUnique({where:{code:data.couponCode.toUpperCase()}});
      amount = result.finalPriceCents ?? Math.round(amount*(1-coupon.discountValue/100));
    }
    const passwordHash=await bcrypt.hash(data.password,12);
    const payment=await prisma.payment.create({
      data:{name:data.name,email:data.email.toLowerCase(),phone:data.phone,passwordHash,planId:data.planId,couponId:coupon?.id||null,amountCents:amount}
    });
    res.status(201).json({
      paymentId: payment.id,
      amountCents: amount,
      plan: plan.name,
      pixKey: process.env.PIX_KEY || "11151101958",
      pixKeyDisplay: process.env.PIX_KEY_DISPLAY || "111.511.019-58",
      pixName: process.env.PIX_MERCHANT_NAME || "Lucas Falco",
      whatsapp: process.env.WHATSAPP_ADMIN || "5541998996206",
    });
  }catch(e){next(e)}
}
async function listPayments(req,res,next){
 try{const ps=await prisma.payment.findMany({include:{plan:true,coupon:true},orderBy:{createdAt:"desc"}});res.json(ps)}catch(e){next(e)}
}
async function approvePayment(req,res,next){
 try{
  const payment=await prisma.payment.findUnique({where:{id:req.params.id},include:{plan:true,coupon:true}});
  if(!payment) return res.status(404).json({error:"Pagamento não encontrado."});
  if(payment.status==="APPROVED") return res.json({ok:true});
  const result=await prisma.$transaction(async tx=>{
    const user=await tx.user.create({data:{email:payment.email,passwordHash:payment.passwordHash,role:"STUDENT",student:{create:{name:payment.name,phone:payment.phone}}},include:{student:true}});
    const now=new Date(), renew=new Date(now.getTime()+30*86400000);
    const sub=await tx.subscription.create({data:{studentId:user.student.id,planId:payment.planId,status:"ACTIVE",startedAt:now,renewsAt:renew}});
    if(payment.couponId) await registerCouponUsage(tx,payment.couponId,user.student.id);
    await tx.payment.update({where:{id:payment.id},data:{status:"APPROVED",approvedAt:now,approvedByUserId:req.user.userId}});
    return {user,sub};
  }, { isolationLevel: "Serializable" });
  res.json({ok:true,student:result.user.student});
 }catch(e){next(e)}
}
async function rejectPayment(req,res,next){try{const p=await prisma.payment.update({where:{id:req.params.id},data:{status:"REJECTED"}});res.json(p)}catch(e){next(e)}}
async function listSubscriptions(req,res,next){
 try{
  const subs=await prisma.subscription.findMany({include:{plan:true,student:{include:{user:{select:{email:true,isActive:true}}}}},orderBy:{renewsAt:"asc"}});
  res.json(subs)
 }catch(e){next(e)}
}
module.exports={createPayment,listPayments,approvePayment,rejectPayment,listSubscriptions};
