const express = require('express');
const router = express.Router();
const middleware = require('../middlewares/auth') 
const userController = require('../controllers/userController')
const questionController = require('../controllers/questionController')
const answerController = require('../controllers/answerController')

//Users APIs 
router.post('/register',userController.registerUser)
router.post('/login',userController.loginUser)
router.get('/user/:userId/profile',middleware.userAuth,userController.getUserProfile)
router.put('/user/:userId/profile',middleware.userAuth,userController.updateUserProfile)

//Questions APIs
router.post('/question',middleware.userAuth,questionController.createQuestion)
router.get('/questions',questionController.getAllQuestion)
router.get('/questions/:questionId',questionController.getQuestionById)
router.put('/questions/:questionId',middleware.userAuth,questionController.updateQuestion)
router.delete('/questions/:questionId',middleware.userAuth,questionController.deleteQuestion)

//Answer APIs
router.post('/answer',middleware.userAuth,answerController.createAnswer)
router.get('/questions/:questionId/answer',answerController.getAllAnswers)
router.put('/answer/:answerId',middleware.userAuth,answerController.updateAnswer)
router.delete('/answers/:answerId',middleware.userAuth,answerController.deleteAnswer)

module.exports = router;