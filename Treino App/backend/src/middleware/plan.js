const prisma=require("../config/db");
function requirePlanFeature(feature){
 return async(req,res,next)=>{
  try{
   if(req.user.role==="ADMIN") return next();
   const sub=await prisma.subscription.findFirst({where:{studentId:req.user.studentId,status:"ACTIVE"},include:{plan:true},orderBy:{renewsAt:"desc"}});
   if(!sub||!sub.plan?.[feature]) return res.status(403).json({error:"Seu plano atual não inclui este recurso."});
   next();
  }catch(e){next(e)}
 }
}
module.exports={requirePlanFeature};
