const {z}=require("zod"); const prisma=require("../config/db");
async function list(req,res,next){try{
 const studentId=req.params.studentId; const student=await prisma.student.findUnique({where:{id:studentId}});
 if(!student) return res.status(404).json({error:"Aluno não encontrado"});
 const msgs=await prisma.message.findMany({where:{studentId},orderBy:{createdAt:"asc"}});
 res.json(msgs);
}catch(e){next(e)}}
async function send(req,res,next){try{
 const {studentId}=req.params; const {body}=z.object({body:z.string().min(1).max(2000)}).parse(req.body);
 const student=await prisma.student.findUnique({where:{id:studentId}});
 if(!student) return res.status(404).json({error:"Aluno não encontrado"});
 const receiver=req.user.role==="ADMIN"?student.userId:(await prisma.user.findFirst({where:{role:"ADMIN"}}))?.id;
 const m=await prisma.message.create({data:{studentId,senderUserId:req.user.userId,receiverUserId:receiver,body}});
 res.json(m);
}catch(e){next(e)}}
module.exports={list,send};
