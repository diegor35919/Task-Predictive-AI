import bcrypt from 'bcryptjs';
import { UserModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const register = async(req,res) =>{
    try{ 
        const {username,email,password} = req.body
        
        const existingUser = await UserModel.findOneByEmail(email);
        if (existingUser) {
            return res.status(400).json({ ok: false, msg: 'El email ya está registrado.' });
        }

        const salt = bcrypt.genSaltSync(10);
        const password_hash = bcrypt.hashSync(password, salt); // Lo renombramos a password_hash
        
        const newUser = await UserModel.create({
            username,
            email,
            password_hash // Usamos el nombre de campo que espera tu Modelo
        });

        const token = jwt.sign({
            email: newUser.email
        },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        )

        return res.status(201).json({
            ok: true,
            msg: token,
            user: newUser
             // newUser contiene {email, username} gracias a RETURNING
        });
    }
    catch(error){
        console.log('Error en el Registro ', error )
        return res.status(500).json({
            ok:false,
            msg:'Error interno en el servidor por favor contacte con el administrador'
        })
    }   
}

const login = async(req,res) =>{
    try{
        const {email, password} = req.body

        if (!email || !password) {
            return res.status(400).json({ ok: false, msg: 'Credenciales incorrectas.' });
        }

        const user = await UserModel.findOneByEmail(email);

        if(!user){
            return res.status(404).json({error : "Credenciales incorrectas."})
        }

        const isMatch = bcrypt.compareSync(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ ok: false, msg: 'Credenciales incorrectas.' });
        }

        const token = jwt.sign({
            email: user.email
        },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        )
        // 3. LOGIN EXITOSO (Aquí deberías generar un JWT, si lo necesitas)
        
        return res.status(200).json({ 
            ok: true, 
            msg: token,
        });
    }

    catch(error){
        console.log('Error en el Login', error);
        return res.status(500).json({
            ok:false,
            msg:'Error interno del servidor.'
        })
    }
}




const profile = async(req,res) =>{

    
    try{
        const user= await UserModel.findOneByEmail(req.email)
        return res.json({ok:true, msg:user})
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({
            ok:false,
            msg:"Error Server"
        })
    }
}



const UserController = {
    register,
    login,
    profile
} 

export default UserController;