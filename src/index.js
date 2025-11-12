import express from 'express'
import 'dotenv/config'
import cors from 'cors';
import morgan from 'morgan';
import userRouter from './routes/users.routes.js'
import taskRouter from './routes/task.routes.js'
import statsRouter from './routes/stats.routes.js'

const app = express();
app.use(express.json());
app.use(cors()); // Permite conexiones de otros orígenes (tu futuro frontend)
app.use(morgan('dev')); // Muestra logs de peticiones en la consola
app.use(express.urlencoded({extended: true}));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1', statsRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT,() => console.log(`Servidor andando en el puerto ${PORT}`))
