
const jwt = require("jsonwebtoken");


const decodeJwt = (token) => {
    return jwt.verify(token, process.env.API_SECRET);
}
const whiteListUrl = ["/login", "/signup"];


function authDecorder(req, res, next) {
    console.log(req.url)
    if (!whiteListUrl.includes(req.url)) {
        console.log(req.headers.authorization)
        if (!req.headers['authorization']) return next('router')
        console.log('Request URL:', req.originalUrl)
        try {
            const tokenDetail = decodeJwt(req.headers['authorization'].split(' ')[1])
            console.log(tokenDetail);
            req.body = {
                tokenDetail,
                data: req.body
            }
            next()
        } catch (error) {
            console.log(error);
            return res.status(401).send({
                message: "Invalid Token"
            })
        }
    }
    else {
        next();
    }
}


module.exports = authDecorder
