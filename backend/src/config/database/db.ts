import { Pool } from 'pg';
import dotenv from 'dotenv';

// Aseguramos que las variables de entorno estén cargadas
dotenv.config();

// Inicializamos el Pool de conexiones
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    // Supabase requiere SSL para conexiones remotas
    ssl: { rejectUnauthorized: false },

    // Opciones recomendadas para producción
    max: 20, // Número máximo de clientes en el pool
    idleTimeoutMillis: 30000, // Cierra clientes inactivos después de 30 segundos
    connectionTimeoutMillis: 10000, // Tiempo máximo esperando conexión (Supabase puede tener latencia en arranque en frío)
});

// Listener para monitorear errores inesperados en el pool
pool.on('error', (err) => {
    console.error('Error inesperado en el cliente de la base de datos', err);
});

/**
 * Función genérica para ejecutar consultas SQL con parámetros seguros
 * y evitar inyecciones SQL.
 */
export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;

        // Opcional: Console.log para debuggear cuánto tardan tus consultas
        // console.log('Consulta ejecutada', { text, duration, rows: res.rowCount });

        return res;
    } catch (error) {
        console.error('Error ejecutando query:', { text, params, error });
        throw error;
    }
};

export default pool;