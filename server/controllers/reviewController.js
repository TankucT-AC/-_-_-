const {Review, Landmark} = require("../models/models")
const ApiError = require('../error/ApiError')

class ReviewController {
    async landmarkView(req, res) {
        const {landmark_id} = req.params;
        const reviews = await Review.findAll({
            where: { landmarkId: landmark_id },
            include: [{
                model: Landmark,
                attributes: ['name']
            }],
            order: [['createdAt', 'DESC']]
        });
        return res.json(reviews);
    }

    async createReview(req, res, next) {
        try {
            const {user_id, landmark_id} = req.params;
            const {rating, comment} = req.body;

            if (!user_id) {
                return next(ApiError.badRequest("Не задан ID пользователя!"))
            }
            if (!landmark_id) {
                return next(ApiError.badRequest("Не задан ID достопримечательности!"))
            }
            if (!rating) {
                return next(ApiError.badRequest("Не задан рейтинг!"))
            }

            // Проверяем, есть ли уже отзыв от этого пользователя
            const existingReview = await Review.findOne({
                where: {
                    userId: user_id,
                    landmarkId: landmark_id
                }
            });

            if (existingReview) {
                return next(ApiError.badRequest("Вы уже оставили отзыв для этой достопримечательности"));
            }

            const review = await Review.create({
                rating,
                comment,
                userId: user_id,
                landmarkId: landmark_id
            });

            return res.json(review);
        } catch (error) {
            return next(ApiError.internal("Ошибка при создании отзыва"));
        }
    }

    async editReview(req, res, next) {
        try {
            const {user_id, landmark_id} = req.params;
            const {rating, comment} = req.body;

            const review = await Review.findOne({
                where: {
                    userId: user_id,
                    landmarkId: landmark_id
                }
            });

            if (!review) {
                return next(ApiError.badRequest("Отзыв не найден"));
            }

            review.rating = rating;
            review.comment = comment;
            await review.save();

            return res.json(review);
        } catch (error) {
            return next(ApiError.internal("Ошибка при редактировании отзыва"));
        }
    }

    async deleteReview(req, res, next) {
        try {
            const {user_id, landmark_id} = req.params;

            const review = await Review.findOne({
                where: {
                    userId: user_id,
                    landmarkId: landmark_id
                }
            });

            if (!review) {
                return next(ApiError.badRequest("Отзыв не найден"));
            }

            await review.destroy();
            return res.json({message: "Отзыв успешно удален"});
        } catch (error) {
            return next(ApiError.internal("Ошибка при удалении отзыва"));
        }
    }

    async getUserReviews(req, res, next) {
        try {
            const {user_id} = req.params;
            const reviews = await Review.findAll({
                where: {userId: user_id},
                include: [{
                    model: Landmark,
                    attributes: ['name']
                }],
                order: [['createdAt', 'DESC']]
            });
            return res.json(reviews);
        } catch (error) {
            return next(ApiError.internal("Ошибка при получении отзывов пользователя"));
        }
    }
}

module.exports = new ReviewController()