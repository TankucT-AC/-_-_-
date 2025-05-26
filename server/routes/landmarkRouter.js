const Router = require('express')
const router = new Router()
const landmarkController = require('../controllers/landmarkController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.get('/landmarks', landmarkController.landmarksList) // список всех достопримечательностей
router.get('/landmarks/:landmark_id', landmarkController.landmark) // детализация одной

router.post('/landmarks', checkRole("ADMIN"),
    landmarkController.createLandmark) // создание достопримечательности
router.put('/landmarks/:landmark_id', checkRole("ADMIN"),
    landmarkController.editLandmark) // редактирование достопримечательности
router.delete('/landmarks/:landmark_id', checkRole("ADMIN"),
    landmarkController.deleteLandmark) // удаление достопримечательности

module.exports = router