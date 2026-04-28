## pasos para ejecutar proyecto 

1. Clonar el repositorio
2. Instalar dependencias con `npm install`
3. Crear un archivo `.env` con las siguientes variables de entorno:

JWT_SECRET = 
JWT_EXPIRES_IN = 
PORT = 
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_NAME=
RESEND_API_KEY=

4. Levantar la base de datos con `docker compose up -d`
5. Ejecutar el proyecto con `npm run dev`
6. El backend estará corriendo en `http://localhost:TU_PUERTO` (reemplaza `TU_PUERTO` por el valor que hayas puesto en el `.env`)



