import {db} from "../database/conection.database.js"



const create = async({email,password_hash, username}) =>{
    const query = {
        text:`
        INSERT INTO users(email,password_hash,username)
        VALUES ($1,$2,$3)
        RETURNING email,username
        `,
        values: [email,password_hash,username]
    }

    const{rows} = await db.query(query)
    return rows[0]
}

const findOneByEmail = async(email) =>{
    const query = {
        text: `
        SELECT * FROM users
        WHERE EMAIL = $1
        `,
        values: [email]
    }
    const { rows} = await db.query(query)
    return rows[0]
}
export const  UserModel={
    create,
    findOneByEmail
}