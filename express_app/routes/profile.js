let express = require('express');
let User = require('../models/User');
let router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // путь к папке, где будут храниться файлы
    },
    filename: function (req, file, cb) {
        cb(null, req.user.dataValues.username + '.png'); // добавляем расширение файла
    }
});

const upload = multer({storage: storage});

router.post('/upload-photo', upload.single('photo'), async (req, res) => {
    const userData = req.body;
    await User.updateUser(req.session.passport.user, {
        'avatarURL': 'http://localhost:3000/uploads/' + req.user.dataValues.username + '.png'
    });

    res.redirect('/');
});

router.post('/', async (req, res, next) => {
    try {
        // Получаем данные из тела запроса
        const userData = req.body;
        await User.updateUser(req.session.passport.user, userData);

        // Отправляем ответ об успешном обновлении
        // res.status(200).send('Data updated successfully!');
        res.redirect('http://localhost:3000')
    } catch (error) {
        // Обработка ошибок, например, ошибок базы данных
        console.error('Error updating user data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/', async (req, res, next) => {
    // Проверяем, существует ли сессия и информация о пользователе
    if (req.session.passport && req.session.passport.user) {
        const userId = req.session.passport.user;
        try {
            // Извлекаем данные пользователя из базы данных
            const user = await User.findByPk(userId);
            if (user) {

                // Рендеринг шаблона с информацией о существовании фото
                res.render('index', {user: user});

            } else {
                // Пользователь не найден
                res.status(404).send('User not found');
            }
        } catch (error) {
            // Обрабатываем ошибку при запросе к базе данных
            console.error('Error fetching user:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        // Пользователь не авторизован или отсутствует информация о пользователе
        res.status(401).send('Unauthorized');
    }
});

module.exports = router;