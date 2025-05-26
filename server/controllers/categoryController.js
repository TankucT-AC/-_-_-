const {Category} = require("../models/models");
const {ApiError} = require("../error/ApiError");
const {DataTypes} = require("sequelize");

class CategoryController {
    async categoryAll(req, res) {
        const categories = await Category.findAll({
            order: [['name', 'ASC']] // Сортировка по имени
        });
        return res.json(categories);
    }

    async createCategory(req, res, next) {
        const {name} = req.body
        if (!name) {
            return next(ApiError.badRequest("Не задано название категории!"))
        }
        const category = await Category.create({name})
        res.json(category)
    }

    async deleteCategory(req, res, next) {
        const {category_id} = req.params
        // проверяем, существует ли категория в БД
        const category = await Category.findByPk(category_id)
        if (!category) {
            return next(ApiError.badRequest("Категория не найдена!"))
        }

        await category.destroy();

        return res.json({message: "Категория удалена!"})
    }
}

module.exports = new CategoryController()