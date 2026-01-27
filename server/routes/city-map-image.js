/**
 * Cities Routes - City Map Image
 */
const express = require('express');
const router = express.Router();
const db = require('../db-mysql');

// Get city map image
router.get('/:cityId/map-image', async (req, res) => {
    try {
        const { cityId } = req.params;
        
        const cities = await db.query(
            'SELECT map_image_url FROM cities WHERE id = ?',
            [cityId]
        );

        if (cities.length > 0 && cities[0].map_image_url) {
            res.json({ imageUrl: cities[0].map_image_url });
        } else {
            res.json({ imageUrl: null });
        }
    } catch (error) {
        console.error('Error fetching city map image:', error);
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

module.exports = router;
