require('dotenv').config(); // Подключение dotenv для работы с переменными окружения
const express = require('express');
const path = require('path');
const sequelize = require('./database');
const passport = require('passport');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();

// Синхронизация базы данных
sequelize.sync()
    .then(() => console.log('Database is connected!'))
    .catch(err => console.error('Database connection error:', err));

// Настройка маршрутов
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const pdfRouter = require('./routes/pdf');

// Настройка движка представлений
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/templates', express.static(path.join(__dirname, 'pdf')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Настройка сессий с использованием Sequelize Store
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultsecret', // Используйте переменную окружения для секретного ключа
    store: new SequelizeStore({
        db: sequelize,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Используйте secure cookies в production
        maxAge: 1000 * 60 * 60 * 24 // 1 день
    }
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Подключение маршрутов
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/download-pdf', pdfRouter);

module.exports = app;
