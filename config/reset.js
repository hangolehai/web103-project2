import dotenv from 'dotenv';
dotenv.config();

import { pool } from './database.js';
import { plants } from '../data/plants.js';

const createPlantsTable = async () => {
    const createTableQuery = `
        DROP TABLE IF EXISTS plants;

        CREATE TABLE IF NOT EXISTS plants (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            scientific_name VARCHAR(255) NOT NULL,
            difficulty VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            light_requirement VARCHAR(255) NOT NULL,
            water_requirement VARCHAR(255) NOT NULL,
            image VARCHAR(255) NOT NULL
        );
    `;

    try {
        await pool.query(createTableQuery);
        console.log('🎉 plants table created successfully');
    } catch (err) {
        console.error('⚠️ error creating plants table', err);
    }
};

const seedPlantsTable = async () => {
    await createPlantsTable();

    for (const plant of plants) {
        const insertQuery = `
            INSERT INTO plants (id, name, scientific_name, difficulty, description, light_requirement, water_requirement, image)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        const values = [
            plant.id,
            plant.name,
            plant.scientificName,
            plant.difficulty,
            plant.description,
            plant.lightRequirement,
            plant.waterRequirement,
            plant.image
        ];

        try {
            await pool.query(insertQuery, values);
            console.log(`✅ ${plant.name} added successfully`);
        } catch (err) {
            console.error(`⚠️ error inserting plant ${plant.name}`, err);
        }
    }
    
    await pool.end();
};

seedPlantsTable();
