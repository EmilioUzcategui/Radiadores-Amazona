## pasos para ejecutar proyecto 

1. Clonar el repositorio
2. Instalar dependencias con `npm install`
3. Crear un archivo `.env` con las siguientes variables de entorno:
```bash
JWT_SECRET = your_jwt_secret_key
JWT_EXPIRES_IN = your_jwt_expiration_time
PORT = your_port_number
DB_USER = your_database_user
DB_PASSWORD = your_database_password
DB_HOST = your_database_host
DB_PORT = your_database_port
DB_NAME = your_database_name
RESEND_API_KEY = your_resend_api_key
```

4. Levantar la base de datos con `docker compose up -d`
5. Ejecutar el proyecto con `npm run dev`
6. El backend estará corriendo en `http://localhost:TU_PUERTO` (reemplaza `TU_PUERTO` por el valor que hayas puesto en el `.env`)



