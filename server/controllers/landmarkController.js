const uuid = require('uuid')
const path = require('path');
const ApiError = require("../error/ApiError");
const {Landmark, Category} = require("../models/models");
const {DataTypes, Op} = require("sequelize");
const {unlink} = require("node:fs");

class LandmarkController {
    //возвращаем все достопримечательности из базы данных
    async landmarksList(req, res) {
        const { search, categoryId } = req.query;
        let where = {};

        if (search) {
            where = {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        const landmarks = await Landmark.findAll({
            where,
            include: [{
                model: Category,
                attributes: ['name']
            }]
        });
        return res.json(landmarks);
    }

    // детализация одной достопримечательности
    async landmark(req, res, next) {
        const {landmark_id} = req.params
        const landmark = await Landmark.findByPk(Number(landmark_id), {
            include: [{
                model: Category,
                attributes: ['name']
            }]
        });
        if (!landmark) {
            return next(ApiError.badRequest("Данной достопримечательности нет в базе данных!"))
        }
        return res.json(landmark)
    }

    // создание достопримечательности
    async createLandmark(req, res, next) {
        const {
            name,
            description,
            location,
            category_id,
        } = req.body

        const category = await Category.findByPk(Number(category_id))
        if (!name) {
            return next(ApiError.badRequest("Не задано название достопримечательности!"))
        } else if (!req.files || !req.files.img) {
            return next(ApiError.badRequest("Нет фото достопримечательности!"))
        } else if (!category) {
            return next(ApiError.badRequest("Категорию, которую вы используете, не существует!"))
        }

        const category_name = category.name
        const {img} = req.files
        let fileName = uuid.v4() + '.jpg'
        await img.mv(path.resolve(__dirname, '..', 'static', fileName))
        const landmark = await Landmark.create({
            name,
            description,
            location,
            category_name,
            img: fileName,
            categoryId: Number(category_id)
        })
        return res.json(landmark)
    }

    // редактирование достопримечательности
    async editLandmark(req, res, next) {
        const {landmark_id} = req.params
        const updates = req.body

        // проверяем, существует ли новая категория из запроса
        const category = await Category.findByPk(Number(updates["category_id"]))
        if (!category) {
            return next(ApiError.badRequest("Такой категории не существует!"))
        }

        // проверяем наличие нового фото
        if (req.files && req.files.img) {
            // находим путь фото через старый landmark
            const landmark = await Landmark.findByPk(Number(landmark_id))
            if (!landmark) {
                return next(ApiError.badRequest("Достопримечательность не найдена!"))
            }
            const oldFilePath = path.resolve(__dirname, '..', 'static', landmark.img)

            // удаляем фото из static
            unlink(oldFilePath, err => {
                if (err) console.log("Фото не обнаружено!")
            })

            const {img} = req.files
            const newFileName = uuid.v4() + ".jpg"
            await img.mv(path.resolve(__dirname, '..', 'static', newFileName))
            updates.img = newFileName
        }

        // обновляем landmark по ID
        await Landmark.update(updates, {
            where: {id: landmark_id},
            returning: true
        })

        const updateLandmark = await Landmark.findByPk(landmark_id)
        return res.json(updateLandmark)
    }

    async deleteLandmark(req, res, next) {
        const {landmark_id} = req.params

        // проверяем, существует ли достопримечательность в БД
        const landmark = await Landmark.findByPk(landmark_id)
        if (!landmark) {
            return next(ApiError.badRequest("Достопримечательность не найдена!"))
        }

        // удаляем фото из static
        const filePath = path.resolve(__dirname, '..', 'static', landmark.img)
        unlink(filePath, err => {
            if (err) console.log("Фото не обнаружено!")
        })

        await landmark.destroy();

        return res.json({message: "Достопримечательность удалена!"})
    }
}

module.exports = new LandmarkController()