// File: api/index.js
// Ini adalah backend serverless kita yang akan berjalan di Vercel.

const express = require('express');
const fetch = require('node-fetch'); // Perlu di-import untuk Vercel environment

const app = express();

// Middleware untuk parsing JSON body
app.use(express.json());

// Endpoint utama untuk menghasilkan konten
app.post('/api/generate', async (req, res) => {
    // Ambil prompt dari body request yang dikirim frontend
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Ambil API Key dari Environment Variables (ini cara yang aman)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set.');
        return res.status(500).json({ error: 'Server configuration error: API key not found.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
    };

    try {
        // Panggil Gemini API dari sisi server
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error('Gemini API Error:', errorBody);
            throw new Error(`Gemini API request failed with status ${apiResponse.status}`);
        }

        const result = await apiResponse.json();

        // Ekstrak dan kirim kembali hasilnya ke frontend
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada konten yang dihasilkan.";
        res.json({ text: generatedText });

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to generate content from the API.' });
    }
});

// Vercel akan menangani routing, jadi kita tidak perlu app.listen()
// Cukup ekspor app-nya
module.exports = app;
