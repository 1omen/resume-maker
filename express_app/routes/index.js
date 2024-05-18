const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    if (req.user) {
        // Рендеринг шаблона с информацией о пользователе
        res.render('index', { user: req.user.dataValues });
    } else {
        // Перенаправление на страницу авторизации, если пользователь не аутентифицирован
        res.redirect('/auth/login');
    }
});

module.exports = router;
