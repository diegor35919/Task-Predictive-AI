    import pg from "pg"
    import 'dotenv/config'
    const pool= pg 
    export const db = new pg.Pool({
        allowExitOnIdle: true,
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE, 
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    })
    

    try{
        await db.query('SELECT NOW()')
        console.log('DATABASE CONECTED')
    }
    catch(error){
        console.log(error)
    }