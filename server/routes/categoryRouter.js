const Router = require('express')
const router = new Router()
const categoryController = require('../controllers/categoryController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.get('/', categoryController.categoryAll) // получение всех категорий
router.post('/', checkRole('ADMIN'),
    categoryController.createCategory) // создание категории
router.delete('/:category_id', checkRole('ADMIN'),
    categoryController.deleteCategory) // удаление категории

module.exports = router