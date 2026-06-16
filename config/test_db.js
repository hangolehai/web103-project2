import dotenv from 'dotenv';
dotenv.config();
import { pool } from './database.js';

async function checkTable() {
    try {
        const res = await pool.query('SELECT id, name, difficulty, scientific_name FROM plants ORDER BY name ASC');
        console.log('\n📊 Current contents of "plants" table in Render:');
        console.table(res.rows);
    } catch (err) {
        console.error('⚠️ Error querying database:', err);
    } finally {
        await pool.end();
    }
}

checkTable();
