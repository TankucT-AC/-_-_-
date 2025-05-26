const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const {User} = require('../models/models')
const {hash} = require("bcrypt");
const jwt = require('jsonwebtoken')

const generateJWT = (id, email, role) => {
    return jwt.sign(
        {id, email, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'})
}

class UserController {
    async registration(req, res, next) {
        const {email, password, role} = req.body
        if (!(email && password)) {
            return next(ApiError.badRequest('Некорректный email или пароль!'))
        }
        const candidate = await User.findOne({where: {email}})
        if (candidate) {
            console.log('debug')
            return next(ApiError.badRequest('Пользователь с таким email уже существует!'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({email, role, password: hashPassword})
        const token = generateJWT(user.id, email, role)
        return res.json({token})
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body
            
            if (!email || !password) {
                return next(ApiError.badRequest('Пожалуйста, введите email и пароль'))
            }

            const user = await User.findOne({where: {email}})
            if (!user) {
                return next(ApiError.badRequest('Пользователь с таким email не найден!'))
            }

            let comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword) {
                return next(ApiError.badRequest('Неверный пароль!'))
            }

            const token = generateJWT(user.id, user.email, user.role)
            return res.json({token})
        } catch (error) {
            console.error('Login error:', error)
            return next(ApiError.internal('Произошла ошибка при входе'))
        }
    }

    async check(req, res) {
        const token = generateJWT(req.user.id, req.user.email, req.user.role)
        return res.json({token})
    }
}

module.exports = new UserController()