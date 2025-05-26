const Router = require('express')
const router = new Router()

const landmarkRouter = require('./landmarkRouter')
const reviewRouter = require('./reviewRouter')
const userRouter = require('./userRouter')
const categoryRouter = require('./categoryRouter')

router.use('/ctgrs', categoryRouter)      // категории
router.use('/user', userRouter)           // пользователи
router.use('/ldmk', landmarkRouter)       // достопримечательности
router.use('/reviews', reviewRouter)      // отзывы

module.exports = router