const jwt =require('jsonwebtoken')
require('dotenv').config();

const userInfo=(req,res,next)=>{
    const token=req.header('auth-token');

    if(!token)
    {
        res.status(401).send({error:"Authenticate using a valid token."})
    }
    try {
        const UserData=jwt.verify(token,process.env.JWT_SECRET2);
        req.currentUser=UserData.id;
        next();

    } catch (error) {
        res.status(401).send({error:"Authenticate using a valid token."})    
    }
}

// module.exports=userInfo;

export default userInfo;