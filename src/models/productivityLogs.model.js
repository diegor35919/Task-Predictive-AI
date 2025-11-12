import { db } from '../database/conection.database.js';

// 1. REGISTRAR UN EVENTO DE TAREA COMPLETADA (Lógica de UPSERT)
const create = async ({ user_id }) => {
    /*
    * Esta es la consulta "mágica". Intenta insertar una nueva fila para hoy.
    * Si ya existe una fila para (user_id, HOY), en lugar de fallar (ON CONFLICT),
    * simplemente le suma 1 a la columna 'tasks_completed' (DO UPDATE).
    */
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

// 2. OBTENER EL HISTORIAL AGRUPADO PARA LA GRÁFICA
const getHistory = async ({ user_id }) => {
    // Esta consulta ahora es MÁS SIMPLE, porque tus datos ya están agrupados.
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