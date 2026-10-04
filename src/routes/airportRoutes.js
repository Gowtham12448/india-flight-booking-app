const express = require('express');
const router = express.Router();
const airports = require('../data/airports');

router.get('/', (req, res) => {
  res.json({ success: true, count: airports.length, data: airports });
});

router.get('/:code', (req, res) => {
  const airport = airports.find(a => a.code.toUpperCase() === req.params.code.toUpperCase());
  if (!airport) {
    return res.status(404).json({ success: false, message: 'Airport not found' });
  }
  res.json({ success: true, data: airport });
});

module.exports = router;
