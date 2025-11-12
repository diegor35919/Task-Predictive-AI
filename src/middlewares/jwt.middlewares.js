import jwt from "jsonwebtoken"
import {UserModel} from "../models/user.model.js"

export const verifyToken = async(req,res,next) =>{

    let authHeader = req.headers.authorization

    if(!authHeader){
        return res.status(401).json( {error: "No se proporcionó token."});
    }
    
    const token = authHeader.split(" ")[1]
    console.log({token})

    if(!token){
        return res.status(401).json({ ok: false, msg: "Formato de token inválido." });
    }

    try{
        
        const {email} = jwt.verify(token,process.env.JWT_SECRET);
        const user = await UserModel.findOneByEmail(email);

        // 4. SI NO EXISTE EL USUARIO   
        if (!user) {
            return res.status(401).json({ ok: false, msg: "Token inválido (usuario no existe)." });
        }

        req.user_id= user.id
        next()
    }
    catch(error)
    {
        console.log(error)
        return res.status(400).json({ error: "TOKEN INVALIDO"})
    }
}