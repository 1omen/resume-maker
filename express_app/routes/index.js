const express = require('express');
const router = express.Router();
const axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.user) {
        res.render('index', { user: req.user.dataValues });
    } else {
        res.redirect('/auth/login');
    }
});

router.post('/predict', async (req, res) => {
    try {
        const { resume_text } = req.body;
        const response = await axios.post('http://localhost:5000/predict', { resume_text });
        const prediction = response.data;
        res.json(prediction);
    } catch (error) {
        console.error('Error predicting resume quality:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
