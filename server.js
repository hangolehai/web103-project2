import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import { pool } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/plants', async (req, res) => {
    const { search } = req.query;
    try {
        let query = `
            SELECT 
                id, 
                name, 
                scientific_name AS "scientificName", 
                difficulty, 
                description, 
                light_requirement AS "lightRequirement", 
                water_requirement AS "waterRequirement", 
                image 
            FROM plants
        `;
        const values = [];

        if (search) {
            query += ` WHERE name ILIKE $1 OR scientific_name ILIKE $1 OR difficulty ILIKE $1`;
            values.push(`%${search}%`);
        }

        query += ` ORDER BY name ASC`;

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error("⚠️ Error fetching plants:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/plants/:id', async (req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                name, 
                scientific_name AS "scientificName", 
                difficulty, 
                description, 
                light_requirement AS "lightRequirement", 
                water_requirement AS "waterRequirement", 
                image 
            FROM plants 
            WHERE id = $1
        `;
        const result = await pool.query(query, [req.params.id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Plant not found" });
        }
    } catch (err) {
        console.error(`⚠️ Error fetching plant with ID ${req.params.id}:`, err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Dynamic Page Routes
// Intercept requests to /plants/:id and serve the generic detail.html
app.get('/plants/:id', async (req, res) => {
    try {
        const query = `SELECT 1 FROM plants WHERE id = $1`;
        const result = await pool.query(query, [req.params.id]);
        if (result.rows.length > 0) {
            res.sendFile(path.join(__dirname, 'public', 'detail.html'));
        } else {
            res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
        }
    } catch (err) {
        console.error(`⚠️ Error routing to plant detail page:`, err);
        res.status(500).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

// Catch-all route for any undefined paths (404 Page)
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
