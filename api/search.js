// File: api/search.js

export default async function handler(req, res) {
    // 1. Ambil keyword pencarian (q) dari URL frontend
    const { q } = req.query;

    // 2. Ambil API Key dari Environment Variables Vercel
    const API_KEY = process.env.SERP_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: "API Key tidak ditemukan di server." });
    }

    if (!q) {
        return res.status(400).json({ error: "Keyword pencarian kosong." });
    }

    // 3. Susun URL asli ke SerpApi
    const targetUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(q)}&gl=id&hl=id&api_key=${API_KEY}`;

    try {
        // 4. Lakukan request dari server Vercel ke SerpApi
        const response = await fetch(targetUrl);
        const data = await response.json();

        // 5. Kembalikan hasilnya ke frontend
        res.status(200).json(data);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Gagal mengambil data dari SerpApi." });
    }
}