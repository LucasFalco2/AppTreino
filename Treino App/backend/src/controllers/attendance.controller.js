const prisma=require("../config/db");
function dayKey(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
async function mark(studentId){
 const d=dayKey(new Date());
 return prisma.workoutAttendance.upsert({where:{student_attendance_date:{studentId,date:d}},update:{completedAt:new Date()},create:{studentId,date:d}});
}
async function streak(studentId){
 const rows=await prisma.workoutAttendance.findMany({where:{studentId},orderBy:{date:"desc"},select:{date:true}});
 const keys=new Set(rows.map(r=>{const d=dayKey(new Date(r.date));return d.toISOString().slice(0,10)}));
 if(!rows.length)return 0;
 let cursor=dayKey(new Date(rows[0].date)), count=0;
 while(keys.has(cursor.toISOString().slice(0,10))){
   count++; cursor.setDate(cursor.getDate()-1);
   while(cursor.getDay()===0||cursor.getDay()===6)cursor.setDate(cursor.getDate()-1);
 }
 return count;
}
async function my(req,res,next){try{res.json({streak:await streak(req.user.studentId)})}catch(e){next(e)}}
async function admin(req,res,next){try{const rows=await prisma.workoutAttendance.findMany({include:{student:{select:{name:true}}},orderBy:{date:"desc"},take:200});res.json(rows)}catch(e){next(e)}}
module.exports={mark,my,admin};
