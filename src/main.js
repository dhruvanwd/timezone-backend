const express = require('express')
require("dotenv")
    .config();
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express()
const { MongoClient } = require('mongodb');
const morgan = require('morgan')
const tzRoutes = require('./routes/timezone')
const authDecorder = require('./middleware/authDecoder')
const userRoutes = require("./routes/user")

const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

app.use(morgan('combined'))
app.use(cors())
app.use(bodyParser.json({}))
app.use(authDecorder)
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})



const dbName = 'toptal';


async function main() {
    const PORT = 5555
    await client.connect();
    console.log(`Connected successfully to server. port:${PORT}`);
    const db = client.db(dbName);
    app.use(userRoutes(db))
    app.use("/tz",tzRoutes(db))
    app.listen(PORT)
}


main().catch(err => console.log(err));
