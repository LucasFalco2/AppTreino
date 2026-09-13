const {z}=require("zod");const prisma=require("../config/db");const path=require("path");const fs=require("fs");const {randomUUID}=require("crypto");
const recordSchema=z.object({studentId:z.string().uuid(),weightKg:z.number().positive().optional(),waistCm:z.number().positive().optional(),abdomenCm:z.number().positive().optional(),chestCm:z.number().positive().optional(),armCm:z.number().positive().optional(),thighCm:z.number().positive().optional(),calfCm:z.number().positive().optional(),skinfoldTriceps:z.number().positive().optional(),skinfoldBiceps:z.number().positive().optional(),skinfoldSubscapular:z.number().positive().optional(),skinfoldSuprailiac:z.number().positive().optional(),skinfoldAbdominal:z.number().positive().optional(),skinfoldThigh:z.number().positive().optional(),skinfoldChest:z.number().positive().optional(),skinfoldAxillaryMidline:z.number().positive().optional(),bodyFatPercent:z.number().positive().optional(),muscleMassKg:z.number().positive().optional(),waterPercent:z.number().positive().optional(),notes:z.string().optional()});
async function createRecord(req,res,next){try{res.status(201).json(await prisma.progressRecord.create({data:recordSchema.parse(req.body)}))}catch(e){next(e)}}
async function listRecords(req,res,next){try{res.json(await prisma.progressRecord.findMany({where:{studentId:req.params.studentId},orderBy:{recordedAt:"asc"}}))}catch(e){next(e)}}
async function uploadPhoto(req,res,next){try{if(!req.file)return res.status(400).json({error:"Envie uma foto."});const rel=`uploads/progress/${req.user.studentId}/${req.file.filename}`;const photo=await prisma.progressPhoto.create({data:{studentId:req.user.studentId,storageKey:rel}});res.status(201).json({...photo,url:`/${rel}`})}catch(e){next(e)}}
async function listPhotos(req,res,next){
 try{
  if(req.user.role!=="ADMIN" && req.params.studentId!==req.user.studentId) return res.status(403).json({error:"Acesso negado."});
  const ps=await prisma.progressPhoto.findMany({where:{studentId:req.params.studentId},orderBy:{takenAt:"asc"}});
  res.json(ps.map(p=>({...p,url:`/api/progress/photos/${p.id}/file`})));
 }catch(e){next(e)}
}
async function getPhotoFile(req,res,next){
 try{
  const photo=await prisma.progressPhoto.findUnique({where:{id:req.params.id}});
  if(!photo) return res.status(404).json({error:"Foto não encontrada."});
  if(req.user.role!=="ADMIN" && photo.studentId!==req.user.studentId) return res.status(403).json({error:"Acesso negado."});
  const file=path.join(process.cwd(), photo.storageKey);
  if(!fs.existsSync(file)) return res.status(404).json({error:"Arquivo não encontrado."});
  res.sendFile(path.resolve(file));
 }catch(e){next(e)}
}
async function deletePhoto(req,res,next){
 try{
  const photo=await prisma.progressPhoto.findUnique({where:{id:req.params.id}});
  if(!photo) return res.status(404).json({error:"Foto não encontrada."});
  if(req.user.role!=="ADMIN" && photo.studentId!==req.user.studentId) return res.status(403).json({error:"Acesso negado."});
  const file=path.join(process.cwd(), photo.storageKey);
  await prisma.progressPhoto.delete({where:{id:req.params.id}});
  if(fs.existsSync(file)) fs.unlinkSync(file);
  res.status(204).send();
 }catch(e){next(e)}
}
const goalSchema=z.object({studentId:z.string().uuid(),type:z.string(),title:z.string(),startValue:z.number().optional(),currentValue:z.number().optional(),targetValue:z.number().optional(),unit:z.string().optional()});
async function createGoal(req,res,next){try{res.status(201).json(await prisma.goal.create({data:goalSchema.parse(req.body)}))}catch(e){next(e)}}
async function listGoals(req,res,next){try{res.json(await prisma.goal.findMany({where:{studentId:req.params.studentId}}))}catch(e){next(e)}}
async function updateGoal(req,res,next){
 try{
  const current=await prisma.goal.findUnique({where:{id:req.params.id}});
  if(!current) return res.status(404).json({error:"Meta não encontrada."});
  if(req.user.role!=="ADMIN" && current.studentId!==req.user.studentId) return res.status(403).json({error:"Acesso negado."});
  res.json(await prisma.goal.update({where:{id:req.params.id},data:z.object({achievedAt:z.string().datetime().nullable().optional(),currentValue:z.number().optional(),targetValue:z.number().optional(),title:z.string().optional(),unit:z.string().optional(),type:z.string().optional()}).parse(req.body)}));
 }catch(e){next(e)}
}
module.exports={createRecord,listRecords,uploadPhoto,listPhotos,getPhotoFile,deletePhoto,createGoal,listGoals,updateGoal};
