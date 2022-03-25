const express = require('express');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { ObjectId } = require("mongodb")




module.exports = (db) => {
    const router = express.Router();
    const users = db.collection('users');

    router.post('/login', async function (req, res) {
        const { username, password } = req.body;
        const user = await users.findOne({
            username,
        });
        if (user) {
            const passwordIsValid = bcrypt.compareSync(
                password,
                user.password
            );
            // checking if password was valid and send response accordingly
            if (!passwordIsValid) {
                return res.status(401)
                    .send({
                        accessToken: null,
                        message: "Invalid Password!"
                    });
            }

            const token = jwt.sign({
                ...user
            }, process.env.API_SECRET, {
                expiresIn: 86400
            });
            res.status(200)
                .send({
                    user,
                    message: "Login successfull",
                    accessToken: token,
                });
        } else {
            res.status(400).send("user doesn't exist")
        }
    })

    router.post('/signup', async function (req, res) {
        const userInfo = req.body
        console.log(userInfo)
        if (userInfo.username && userInfo.password) {
            await users.insertOne({ ...userInfo, password: bcrypt.hashSync(userInfo.password, 8) })
            res.send('signup suceess....!');
        } else {
            res.status(400).send("invalid user info data")
        }
    });


    router.delete('/user', async (req, res) => {
        try {
            const { _id } = req.query
            await users.deleteOne({ _id: ObjectId(_id) })
            res.send({
                message: "user deleted successfully....!"
            });
        } catch (error) {
            console.warn(error);
            res.status(400).send({ message: error.message })
        }
    })





    router.get("/users", async (req, res) => {
        try {
            const { tokenDetail } = req.body;
            const { pageNumber, nPerPage, searchText, role } = req.query;

            const filerQuery = {}

            if (tokenDetail.role == 'user') {
                filerQuery.managerId = tokenDetail['_id'];
                filerQuery.name = { $regex: `^${searchText}`, $options: 'i' }
            } else {
                filerQuery.role = role;
            }

            const cursor = await users.find(filerQuery).skip((Number(pageNumber)) * Number(nPerPage)).limit(Number(nPerPage))

            res.send({
                "message": "success", data: {
                    data: await cursor.toArray(),
                    count: await cursor.count()
                }
            })
        } catch (error) {
            console.warn(error);
            res.status(400).send({ message: error.message })
        }
    })



    return router
};