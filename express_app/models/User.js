const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class User extends Model {
    static async updateUser(id, updateData) {
        try {
            // Находим пользователя по id
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('User not found');
            }
            // Обновляем пользователя данными из updateData
            await user.update(updateData);
            return user; // Возвращаем обновленные данные
        } catch (error) {
            // Пробрасываем ошибку дальше
            throw error;
        }
    }
}

User.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING
    },
    desiredPosition: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    phoneNumber: {
        type: DataTypes.STRING
    },
    age: {
        type: DataTypes.INTEGER
    },
    city: {
        type: DataTypes.STRING
    },
    skills: {
        type: DataTypes.STRING
    },
    workExperience: {
        type: DataTypes.STRING,
        get() {
            const rawData = this.getDataValue('workExperience');
            return rawData ? rawData.split(';') : [];
        },
        set(value) {
            this.setDataValue('workExperience', value.join(';'));
        }
    },
    education: {
        type: DataTypes.STRING,
        get() {
            const rawData = this.getDataValue('education');
            return rawData ? rawData.split(';') : [];
        },
        set(value) {
            this.setDataValue('education', value.join(';'));
        }
    },
    aboutMe: {
        type: DataTypes.TEXT
    },
    avatarURL: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'user'
});

module.exports = User;