const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q37bxqk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const packagesCollection = client.db("tour").collection("packages")
        app.get('/home', async (req, res) => {
            const query =  {};
            const cursor  = packagesCollection.find(query).limit(3);
            const allData = await cursor.toArray()
            res.send(allData)
        })
        app.get('/packages', async (req, res) => {
            const query =  {};
            const cursor  = packagesCollection.find(query);
            const allData = await cursor.toArray()
            res.send(allData)
        })
    }
    finally {
        console.log()
    }
}
run().catch(e => console.log(e.message))

app.get('/', (req, res) => {
    res.send('Hello World!')
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})