const {Sequelize} = require('sequelize')

const sequelize = new Sequelize('database', 'user', 'password', {
    dialect: 'sqlite',
    host: './database.sqlite'
})

module.exports = sequelize