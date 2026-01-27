/**
 * ADMIN ROUTES - City Image Upload
 */

const express = require('express');
const router = express.Router();
const db = require('../db-mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Admin middleware
function requireAdmin(req, res, next) {
    if (!req.session || !req.session.passport || !req.session.passport.user) {
        return res.status(401).json({ error: 'Nicht eingeloggt' });
    }
    next();
}

// Configure multer for city images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../public/assets/cities');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'city-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Nur Bilder erlaubt (JPEG, PNG, GIF, WebP)'));
        }
    }
});

// Upload city image
router.post('/cities/:cityId/upload-image', requireAdmin, upload.single('cityImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }

    try {
        const { cityId } = req.params;
        const imageUrl = `/public/assets/cities/${req.file.filename}`;
        
        // Get old image to delete
        const oldCity = await db.query('SELECT image_url FROM cities WHERE id = ?', [cityId]);
        
        // Update city with new image
        await db.query('UPDATE cities SET image_url = ? WHERE id = ?', [imageUrl, cityId]);
        
        // Delete old image file if exists
        if (oldCity.length > 0 && oldCity[0].image_url) {
            const oldPath = path.join(__dirname, '../../', oldCity[0].image_url);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        res.json({ 
            success: true, 
            imageUrl,
            message: 'Stadtbild erfolgreich hochgeladen'
        });
    } catch (error) {
        console.error('Error uploading city image:', error);
        res.status(500).json({ error: 'Fehler beim Hochladen des Stadtbildes' });
    }
});

// Upload city map
router.post('/cities/:cityId/upload-map', requireAdmin, upload.single('cityMap'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }

    try {
        const { cityId } = req.params;
        const mapUrl = `/public/assets/cities/${req.file.filename}`;
        
        // Get old map to delete
        const oldCity = await db.query('SELECT city_map_url FROM cities WHERE id = ?', [cityId]);
        
        // Update city with new map
        await db.query('UPDATE cities SET city_map_url = ? WHERE id = ?', [mapUrl, cityId]);
        
        // Delete old map file if exists
        if (oldCity.length > 0 && oldCity[0].city_map_url) {
            const oldPath = path.join(__dirname, '../../', oldCity[0].city_map_url);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        res.json({ 
            success: true, 
            mapUrl,
            message: 'Stadtkarte erfolgreich hochgeladen'
        });
    } catch (error) {
        console.error('Error uploading city map:', error);
        res.status(500).json({ error: 'Fehler beim Hochladen der Stadtkarte' });
    }
});

// Delete city image
router.delete('/cities/:cityId/image', requireAdmin, async (req, res) => {
    try {
        const { cityId } = req.params;
        
        const city = await db.query('SELECT image_url FROM cities WHERE id = ?', [cityId]);
        
        if (city.length > 0 && city[0].image_url) {
            // Delete file
            const filePath = path.join(__dirname, '../../', city[0].image_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            // Remove from database
            await db.query('UPDATE cities SET image_url = NULL WHERE id = ?', [cityId]);
        }

        res.json({ success: true, message: 'Stadtbild gelöscht' });
    } catch (error) {
        console.error('Error deleting city image:', error);
        res.status(500).json({ error: 'Fehler beim Löschen des Stadtbildes' });
    }
});

// Delete city map
router.delete('/cities/:cityId/map', requireAdmin, async (req, res) => {
    try {
        const { cityId } = req.params;
        
        const city = await db.query('SELECT city_map_url FROM cities WHERE id = ?', [cityId]);
        
        if (city.length > 0 && city[0].city_map_url) {
            // Delete file
            const filePath = path.join(__dirname, '../../', city[0].city_map_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            // Remove from database
            await db.query('UPDATE cities SET city_map_url = NULL WHERE id = ?', [cityId]);
        }

        res.json({ success: true, message: 'Stadtkarte gelöscht' });
    } catch (error) {
        console.error('Error deleting city map:', error);
        res.status(500).json({ error: 'Fehler beim Löschen der Stadtkarte' });
    }
});

module.exports = router;
