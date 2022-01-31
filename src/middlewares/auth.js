const jwt = require('jsonwebtoken');
const secretKey = 'project/quora-Joy_Bhattacharya'


const userAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization', 'Bearer Token')
        if (!token) {
            return res.status(403).send({ status: false, message: `Missing authentication token in request` })
        }
        let splitToken = token.split(' ')

        let decodeToken = jwt.decode(splitToken[1], secretKey)
        if (Date.now() > (decodeToken.exp) * 1000) {
            return res.status(403).send({ status: false, message: `Session Expired, please login again` })
        }

        let verify = await jwt.verify(splitToken[1], secretKey)
        if (!verify) {
            return res.status(403).send({ status: false, message: `Invalid authentication token in request` })

        }

        req.userId = verify.userId
        next()

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = {
    userAuth
}