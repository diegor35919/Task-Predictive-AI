import {TaskModel} from "../models/task.model.js"
import { ProductivityLogModel } from "../models/productivityLogs.model.js"; // ¡NUEVA IMPORTACIÓN!

const create = async (req, res) => {
    
    try {
        // El user_id viene del middleware de autenticación (JWT)
        const user_id = req.user_id; 
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ ok: false, msg: 'El título de la tarea es obligatorio.' });
        }

        const newTask = await TaskModel.create({
            title,
            description,
            user_id
        });

        return res.status(201).json({ 
            ok: true, 
            msg: 'Tarea creada exitosamente.',
            task: newTask 
        });



    } catch (error) {
        console.error('Error al crear la tarea:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al crear la tarea.'
        });
    }
}




const getAllByUser = async (req, res) => {
    try {
        const user_id = req.user_id; // Obtenido del JWT/Middleware

        const tasks = await TaskModel.findByUser({ user_id });

        return res.status(200).json({
            ok: true,
            tasks
        });

    } catch (error) {
        console.error('Error al obtener las tareas:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al obtener las tareas.'
        });
    }
}



// --- FUNCIÓN 'updateTask' CON DEPURACIÓN ---
const updateTask = async (req, res) => {
    
    

    try {
        const user_id = req.user_id;
        const { id } = req.params;
        const { title, description, status } = req.body; // 'status' es el nuevo estado

        

        // --- PASO A: Buscar la tarea PRIMERO ---
        const currentTask = await TaskModel.findById({ id, user_id });

        if (!currentTask) {
            return res.status(404).json({ ok: false, msg: 'Tarea no encontrada.' });
        }

        // Validaciones
        if (!title || !status) {
             
             return res.status(400).json({ ok: false, msg: 'El título y el estado son obligatorios.' });
        }
        if (!['pending', 'in_progress', 'completed'].includes(status)) {
            
             return res.status(400).json({ ok: false, msg: 'Estado de tarea inválido.' });
        }

        // --- PASO B: Actualizar la tarea ---
        const updatedTask = await TaskModel.update({
            id,
            user_id,
            title,
            description: description || null,
            status
        });

        // --- PASO C: LÓGICA DE REGISTRO ---
       

        if (status === 'completed' && currentTask.status !== 'completed') {
            
            
            
            await ProductivityLogModel.create({ user_id: req.user_id }); 
        
        } 

        // --- PASO D: Responder ---
        return res.status(200).json({
            ok: true,
            msg: 'Tarea actualizada exitosamente.',
            task: updatedTask
        });

    } catch (error) {
        
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al actualizar la tarea.'
        });
    }
}


const removeTask = async (req, res) => {
    try {
        const user_id = req.user_id; // Obtenido del JWT/Middleware
        const { id } = req.params; // ID de la tarea a eliminar

        const removedTask = await TaskModel.remove({ id, user_id });

        if (!removedTask) {
            return res.status(404).json({ ok: false, msg: 'Tarea no encontrada o no pertenece al usuario.' });
        }

        return res.status(200).json({
            ok: true,
            msg: 'Tarea eliminada exitosamente.',
            task: removedTask // Opcional: devolver la tarea eliminada
        });

    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al eliminar la tarea.'
        });
    }
}



const getOneById = async (req, res) => {
    try {
        const user_id = req.user_id;
        const { id } = req.params;

        const task = await TaskModel.findById({ id, user_id });

        if (!task) {
            return res.status(404).json({ ok: false, msg: 'Tarea no encontrada o no pertenece al usuario.' });
        }

        return res.status(200).json({
            ok: true,
            task
        });

    } catch (error) {
        console.error('Error al obtener la tarea:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al obtener la tarea.'
        });
    }
}


const TaskController = {
    create,
    getAllByUser,
    updateTask,
    removeTask,
    getOneById
}

export default TaskController;