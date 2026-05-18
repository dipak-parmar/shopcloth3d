const http = require('http');
const fs = require('fs');
const path = require('path');
const sendEmailHandler = require('./api/send-email.js');

const PORT = 8000;

const server = http.createServer((req, res) => {
    // Resolve URL to prevent directory traversal
    const cleanUrl = req.url.split('?')[0];

    if (cleanUrl === '/api/send-email' && (req.method === 'POST' || req.method === 'OPTIONS')) {
        // CORS preflight handling
        if (req.method === 'OPTIONS') {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            return res.end();
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const mockReq = {
                method: req.method,
                body: body ? JSON.parse(body) : {}
            };
            const mockRes = {
                setHeader: (name, value) => { res.setHeader(name, value); },
                status: (code) => {
                    res.statusCode = code;
                    return {
                        json: (data) => {
                            res.writeHead(res.statusCode, { 
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            });
                            res.end(JSON.stringify(data));
                        },
                        end: () => {
                            res.end();
                        }
                    };
                }
            };
            try {
                await sendEmailHandler(mockReq, mockRes);
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);
    
    // Safety check
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            return res.end('File Not Found');
        }

        let contentType = 'text/html';
        const ext = path.extname(filePath);
        if (ext === '.js') contentType = 'application/javascript';
        else if (ext === '.css') contentType = 'text/css';
        else if (ext === '.glb') contentType = 'model/gltf-binary';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.mp3') contentType = 'audio/mpeg';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Immersive 3D Shop running locally at http://localhost:${PORT}/`);
    console.log(`📧 Backend local API integrated at http://localhost:${PORT}/api/send-email`);
});
