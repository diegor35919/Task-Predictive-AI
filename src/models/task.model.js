import {db} from "../database/conection.database.js"

const create = async({title, description, user_id}) =>{
    const query = {
        text:`
        INSERT INTO tasks(title,description,user_id)
        VALUES ($1,$2,$3)
        RETURNING *
        `,
        values: [title,description,user_id]
    }

    const{rows} = await db.query(query)
    return rows[0]
}

const findByUser = async({user_id}) =>{
    const query = {
        text:`
        SELECT * FROM tasks
        WHERE user_id = $1
        ORDER BY created_at DESC    
        `,
        values:[user_id]
    }
    const {rows} = await db.query(query)
    return rows
    
}

const update = async ({ id, user_id, title, description, status }) => {
    const query = {
        text: `
        UPDATE tasks
        SET title = $1, description = $2, status = $3
        WHERE id = $4 AND user_id = $5
        RETURNING *
        `,
        values: [title, description, status, id, user_id]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const remove = async ({ id, user_id }) => {
    const query = {
        text: `
        DELETE FROM tasks
        WHERE id = $1 AND user_id = $2
        RETURNING *
        `,
        values: [id, user_id]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const findById = async ({ id, user_id }) => {
    const query = {
        text: `
        SELECT * FROM tasks
        WHERE id = $1 AND user_id = $2
        `,
        values: [id, user_id]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

export const TaskModel = {
    create,
    findByUser,
    update,
    remove,
    findById
}