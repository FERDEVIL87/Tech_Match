// File: api/landing.js
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    // 1. Konfigurasi kredensial dari Environment Variables Vercel
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3307,
        connectTimeout: 10000 // Timeout 10 detik
    };

    let connection;

    try {
        // 2. Buka koneksi ke MySQL Filess.io
        connection = await mysql.createConnection(dbConfig);

        if (req.method === 'GET') {
            // AMBIL DATA: Untuk ditampilkan di Landing Page frontend
            const [rows] = await connection.execute('SELECT config_data FROM landing_config WHERE id = 1');
            
            if (rows.length > 0) {
                // Parse JSON jika dari database terbaca sebagai string
                const data = typeof rows[0].config_data === 'string' ? JSON.parse(rows[0].config_data) : rows[0].config_data;
                return res.status(200).json(data);
            } else {
                return res.status(404).json({ error: "Data konfigurasi belum di-setup di database." });
            }

        } else if (req.method === 'POST') {
            // SIMPAN DATA: Menerima payload dari Admin Dashboard
            const newData = req.body;
            
            if (!newData || !newData.hero) {
                return res.status(400).json({ error: "Struktur data yang dikirim tidak valid." });
            }

            // Ubah objek Javascript kembali menjadi string JSON sebelum disimpan ke DB
            const jsonString = JSON.stringify(newData);
            
            // Timpa data JSON yang ada di baris id = 1
            await connection.execute(
                'UPDATE landing_config SET config_data = ? WHERE id = 1',
                [jsonString]
            );
            
            return res.status(200).json({ success: true, message: "UI Landing Page berhasil diperbarui dan tersimpan permanen!" });
        } 
        
        // Handle metode selain GET / POST
        else {
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

    } catch (error) {
        console.error("Database Connection Error:", error);
        return res.status(500).json({ error: "Gagal terhubung atau memproses database.", details: error.message });
    } finally {
        // 3. WAJIB DI VERCEL: Tutup koneksi agar resource RAM serverless tidak menggantung
        if (connection) {
            await connection.end();
        }
    }
}