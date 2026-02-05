const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, '.data', 'votos.json'); // .data folder is persistent in Glitch
const STATIC_DIR = __dirname;
const ADMIN_PASS = 'admin123';

// Ensure .data directory exists for Glitch persistence
if (!fs.existsSync(path.join(__dirname, '.data'))) {
    try {
        fs.mkdirSync(path.join(__dirname, '.data'));
    } catch (e) {
        // Fallback for local if .data creation fails or not needed
    }
}
// Fallback to root if .data write fails or for local compatibility
const FINAL_DATA_FILE = fs.existsSync(path.join(__dirname, '.data')) ? DATA_FILE : path.join(__dirname, 'votos.json');

// Inicializar archivo de datos si no existe
if (!fs.existsSync(FINAL_DATA_FILE)) {
    fs.writeFileSync(FINAL_DATA_FILE, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
    // === CORS Básico (Permitir todo para máxima compatibilidad) ===
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = req.url; // URL solicitada
    const method = req.method;

    // 1. ENDPOINT DE VOTACIÓN (El "Buzón Secreto")
    if (url === '/vote' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const nuevoVoto = JSON.parse(body);
                // Añadir timestamp de servidor para doble verificación
                nuevoVoto.server_received_at = new Date().toISOString();

                // MEJORA: Obtener IP real incluso detrás de proxies (Replit/Ngrok/Glitch)
                const realIp = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.socket.remoteAddress;
                // Si el cliente no mandó IP (falló fetch) o mandó una fake, usamos la del servidor
                if (!nuevoVoto.public_ip || nuevoVoto.public_ip === 'Desconocida') {
                    nuevoVoto.public_ip = realIp;
                    nuevoVoto.ip_source = "Server-Extracted";
                }

                // Leer, actualizar y guardar
                const data = JSON.parse(fs.readFileSync(FINAL_DATA_FILE));
                data.push(nuevoVoto);
                fs.writeFileSync(FINAL_DATA_FILE, JSON.stringify(data, null, 2));

                console.log(`[TRACKING] Nuevo dato capturado de IP: ${nuevoVoto.public_ip || 'Desconocida'}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok' }));
            } catch (e) {
                res.writeHead(500);
                res.end('Error interno');
            }
        });
        return;
    }

    // 2. PANEL ADMIN (Protegido)
    if (url === '/admin') {
        // Verificar Basic Auth
        const auth = req.headers['authorization'];

        if (!auth) {
            res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Panel de Control Secreto"' });
            res.end('Acceso Restringido');
            return;
        }

        // Decodificar auth (Basic base64)
        const creds = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
        const pass = creds[1];

        if (pass !== ADMIN_PASS) {
            res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Panel de Control Secreto"' });
            res.end('Contraseña Incorrecta');
            return;
        }

        // Si pasa, mostrar panel
        const rawData = JSON.parse(fs.readFileSync(FINAL_DATA_FILE));

        // Generar HTML simple
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>👁️ Panel de Control - Tracking</title>
            <style>
                body { font-family: monospace; padding: 20px; background: #222; color: #0f0; }
                h1 { border-bottom: 2px solid #0f0; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #444; padding: 8px; text-align: left; font-size: 12px; }
                th { background: #333; color: white; }
                tr:hover { background: #333; }
                .meta { color: #888; }
                .stats { margin-bottom: 20px; padding: 10px; border: 1px solid #0f0; }
            </style>
        </head>
        <body>
            <h1>CENTRO DE INTELIGENCIA :: VOTOS CAPTURADOS</h1>
            
            <div class="stats">
                Total Registros: ${rawData.length} | 
                Perros: ${rawData.filter(x => x.voto === 'perro').length} | 
                Gatos: ${rawData.filter(x => x.voto === 'gato').length}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Hora (Server)</th>
                        <th>IP Pública</th>
                        <th>Voto</th>
                        <th>User Agent / Sistema</th>
                        <th>Tiempo en Pág</th>
                        <th>Coords Click</th>
                    </tr>
                </thead>
                <tbody>
                    ${rawData.map(row => `
                    <tr>
                        <td>${row.server_received_at}</td>
                        <td>${row.public_ip}</td>
                        <td style="color: ${row.voto === 'perro' ? 'orange' : 'cyan'}">${row.voto.toUpperCase()}</td>
                        <td>
                            ${row.userAgent}<br>
                            <span class="meta">${row.platform} | ${row.screen}</span>
                        </td>
                        <td>${row.tiempo_decision_ms} ms</td>
                        <td>X:${row.click_x} Y:${row.click_y}</td>
                    </tr>
                    `).reverse().join('')}
                </tbody>
            </table>
            
            <p><a href="/data.json" style="color: yellow">⬇️ Descargar RAW JSON</a></p>
        </body>
        </html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
    }

    // 3. EXPORTAR DATOS RAW
    if (url === '/data.json') {
        // Protección simple también aquí
        const auth = req.headers['authorization'];
        if (!auth) {
            res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Datos"' });
            res.end();
            return;
        }

        const data = fs.readFileSync(FINAL_DATA_FILE);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
        return;
    }

    // 4. SERVIR ARCHIVOS ESTÁTICOS (Frontend)
    let filePath = path.join(STATIC_DIR, url === '/' ? 'index.html' : url);
    const ext = path.extname(filePath);

    // Mapeo simple de MIME types
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found - El archivo no existe');
            } else {
                res.writeHead(500);
                res.end('Error del servidor: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

});

server.listen(PORT, () => {
    console.log(`\n=============================================`);
    console.log(`😈 SERVER ACTIVO EN: http://localhost:${PORT}`);
    console.log(`💀 PANEL ADMIN:      http://localhost:${PORT}/admin`);
    console.log(`🔐 PASSWORD:         ${ADMIN_PASS}`);
    console.log(`=============================================\n`);
});
