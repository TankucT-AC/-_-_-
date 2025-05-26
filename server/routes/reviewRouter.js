const Router = require('express')
const router = new Router()
const reviewController = require('../controllers/reviewController')

// Получение отзывов для достопримечательности
router.get('/landmark/:landmark_id', reviewController.landmarkView)

// Получение отзывов пользователя
router.get('/:user_id/reviews', reviewController.getUserReviews)

// Создание отзыва
router.post('/:user_id/:landmark_id', reviewController.createReview)

// Редактирование отзыва
router.put('/:user_id/:landmark_id', reviewController.editReview)

// Удаление отзыва
router.delete('/:user_id/:landmark_id', reviewController.deleteReview)

module.exports = router