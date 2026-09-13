const {z}=require("zod"); const prisma=require("../config/db");
const schema=z.object({
 birthDate:z.string().optional(),gender:z.string().optional(),heightCm:z.number().positive().optional(),weightKg:z.number().positive().optional(),
 objective:z.string().min(2),routine:z.string().min(2),nutritionNotes:z.string().optional(),
 allergies:z.string().optional(),trainingFrequency:z.number().int().min(1).max(7).optional()
});
async function save(req,res,next){try{
 const d=schema.parse(req.body); const s=await prisma.student.update({where:{id:req.user.studentId},data:{
 birthDate:d.birthDate?new Date(d.birthDate):undefined,gender:d.gender,heightCm:d.heightCm, currentWeightKg:d.weightKg,objective:d.objective,routine:d.routine,trainingFrequency:d.trainingFrequency,nutritionNotes:[d.nutritionNotes,d.allergies&&`Alergias/restrições: ${d.allergies}`,d.trainingFrequency&&`Frequência: ${d.trainingFrequency}x/semana`].filter(Boolean).join("\n"),onboardingCompleted:true
 }});
 res.json(s);
}catch(e){next(e)}}
async function me(req,res,next){try{res.json(await prisma.student.findUnique({where:{id:req.user.studentId}}))}catch(e){next(e)}}
module.exports={save,me};
