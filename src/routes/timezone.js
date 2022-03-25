const express = require('express');
const { ObjectId } = require("mongodb")


module.exports = (db) => {
    const router = express.Router();
    const timezoneCol = db.collection('timezone');
    router.post("/", async (req, res) => {
        const { data, tokenDetail } = req.body;
        try {
            const result = await timezoneCol.insertOne({
                userId: tokenDetail['_id'],
                ...data
            })
            res.send({ "message": "success", data: result })
        } catch (error) {
            res.status(400).send({ message: error.message })
        }
    })

    router.put("/", async (req, res) => {
        const { data, tokenDetail } = req.body;
        const { _id, ...updateInfo } = data;
        await timezoneCol.findOneAndUpdate({
            _id: ObjectId(data[_id]),
        }, {
            $set: updateInfo
        })
        res.send({ "message": "timezone updated successfully !" })
    })

    router.get("/", async (req, res) => {
        try {
            const { tokenDetail } = req.body;
            const { pageNumber, nPerPage, searchText } = req.query;

            const cursor = await timezoneCol.find({
                userId: tokenDetail['_id'],
                name: { $regex: `^${searchText}`, $options: 'i' }
            }).skip((Number(pageNumber)) * Number(nPerPage)).limit(Number(nPerPage))

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

    router.delete("/", async (req, res) => {
        const { tokenDetail } = req.body;
        const { _id } = req.params;
        await timezoneCol.deleteOne({
            _id: ObjectId(_id)
        });
        res.send("Deleted successfully...!")
    })
    return router
};