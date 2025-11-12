// Importamos el modelo que acabamos de crear
import { ProductivityLogModel } from '../models/productivityLogs.model.js';

const getHistory = async (req, res) => {
    try {
        // Obtenemos el user_id del token (gracias al middleware verifyToken)
        const user_id = req.user_id;

        // 1. Pedimos el historial al modelo
        const history = await ProductivityLogModel.getHistory({ user_id });

        // 2. Respondemos con los datos
        return res.status(200).json({
            ok: true,
            history: history
        });

    } catch (error) {
        console.error('Error al obtener el historial de productividad:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor.'
        });
    }
};

export const StatsController = {
    getHistory
};