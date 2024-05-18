const express = require('express');
const User = require('../models/User');
const router = express.Router();
const ejs = require('ejs');
const path = require('path');
const puppeteer = require('puppeteer');

router.get('/', async (req, res) => {
    let user = {};
    if (req.session.passport && req.session.passport.user) {
        const userId = req.session.passport.user;
        try {
            // Извлекаем данные пользователя из базы данных
            user = await User.findByPk(userId);
        } catch (error) {
            // Обрабатываем ошибку при запросе к базе данных
            console.error('Error fetching user:', error);
            return res.status(500).send('Internal Server Error');
        }
    } else {
        // Пользователь не авторизован или отсутствует информация о пользователе
        return res.status(401).send('Unauthorized');
    }

    const templatePath = path.join(__dirname, '../pdf/template_1.ejs');
    const options = {};

    try {
        // Рендерим HTML с помощью ejs
        const htmlContent = await ejs.renderFile(templatePath, { user: user.dataValues }, options);

        // Запускаем Headless Chrome
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Устанавливаем HTML контент
        await page.setContent(htmlContent);

        // Опции для PDF
        const pdfOptions = {
            format: 'A4',
            printBackground: true
        };

        // Создаем PDF из HTML
        const pdf = await page.pdf(pdfOptions);

        // Закрываем браузер
        await browser.close();

        // Форматируем дату и время в формат "YYYY-MM-DD_HH-MM"
        const now = new Date();
        const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

        // Создаем название файла
        const filename = `resume_${formattedTime}.pdf`;

        // Устанавливаем HTTP заголовки для скачивания файла
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        // Отправляем PDF пользователю
        res.send(pdf);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
