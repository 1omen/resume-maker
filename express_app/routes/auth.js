const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', (error, hashedPassword) => {
            if (error) {
                return done(error);
            }

            if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
                return done(null, false, { message: 'Incorrect username or password.' });
            }

            return done(null, user);
        });
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login?failed=1'
}));

router.get('/login', (req, res) => {
    const { failed } = req.query;
    res.render('login', { failed });
});

router.post('/signup', async (req, res) => {
    const salt = crypto.randomBytes(16);

    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async (error, hashedPassword) => {
        if (error) {
            return res.redirect('/auth/signup?failed=1');
        }

        try {
            const user = await User.create({ username: req.body.username, password: hashedPassword, salt });

            req.login(user, (error) => {
                if (error) {
                    return res.redirect('/auth/signup?failed=3');
                }
                res.redirect('/');
            });
        } catch (error) {
            res.redirect('/auth/signup?failed=2');
        }
    });
});

router.get('/signup', (req, res) => {
    const { failed } = req.query;
    const messages = {
        '1': 'Something went wrong on our side.',
        '2': 'Username is already taken.',
        '3': 'Failed to login.'
    };

    res.render('signup', { failed, message: messages[failed] || '' });
});

router.post('/logout', (req, res, next) => {
    req.logout((error) => {
        if (error) {
            return next(error);
        }
        res.redirect('/');
    });
});

module.exports = router;
