# Sistema de Encuesta "Inocente" con Tracking 🕵️‍♂️

Este paquete contiene un sistema completo de recolección de datos disfrazado de encuesta viral "Dogs vs Cats".

## Archivos
- `index.html`: El frontend (la "fachada"). Diseño amigable y código de tracking oculto.
- `server.js`: El backend (el "centro de control"). Servidor Node.js nativo.
- `votos.json`: Base de datos local donde se guardan los registros.
- `*.png`: Recursos gráficos generados.

## 🚀 Cómo Iniciar

1. Asegúrate de tener Node.js instalado.
2. Abre una terminal en esta carpeta.
3. Ejecuta el servidor:
   ```bash
   node server.js
   ```

## 🎮 Uso

1. **La Víctima (Usuario)**:
   - Envía el link `http://localhost:8080` a tus usuarios (o tu IP pública si abres puertos).
   - Verán una encuesta linda de animales.
   - Al votar, su información es enviada silenciosamente al servidor.

2. **El Administrador (Tú)**:
   - Entra a `http://localhost:8080/admin`
   - Usuario: (Cualquiera, solo pide pass en Basic Auth muchas veces) o simplemente deja usuario en blanco si el navegador lo pide.
   - **Contraseña**: `admin123`
   - Verás la tabla con IPs, timestamps, horas, clicks, etc.

## ⚠️ Nota Educativa
Este código es para propósitos educativos y de demostración de cómo funcionan los trackers web. Asegúrate de cumplir con las leyes de privacidad (GDPR, etc.) si lo usas en un entorno real.
