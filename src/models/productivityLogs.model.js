import { db } from '../database/conection.database.js';


const create = async ({ user_id }) => {

    const query = {
        text: `
            INSERT INTO productivity_logs (user_id, date, tasks_completed) 
            VALUES ($1, NOW()::DATE, 1) 
            ON CONFLICT (user_id, date) 
            DO UPDATE SET 
                tasks_completed = productivity_logs.tasks_completed + 1
            RETURNING *
        `,
        values: [user_id],
    };

    const { rows } = await db.query(query);
    return rows[0];
};


const getHistory = async ({ user_id }) => {

    const query = {
        text: `
            SELECT 
                date, 
                tasks_completed as "completedCount"
            FROM productivity_logs
            WHERE user_id = $1
            ORDER BY date ASC;
        `,
        values: [user_id],
    };

    const { rows } = await db.query(query);
    return rows;
};


export const ProductivityLogModel = {
    create,
    getHistory
};