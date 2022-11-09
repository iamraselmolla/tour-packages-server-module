const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q37bxqk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const packagesCollection = client.db("tour").collection("packages")
        const reviewsCollection = client.db("tour").collection("reviews")
        app.get('/home', async (req, res) => {
            const query =  {};
            const cursor  = packagesCollection.find(query).limit(3);
            const allData = await cursor.toArray();
            res.send(allData);
        })
        app.get('/packages', async (req, res) => {
            const query =  {};
            const cursor  = packagesCollection.find(query);
            const allData = await cursor.toArray();
            res.send(allData);
        })
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const cursor = await packagesCollection.findOne(query);
            res.send(cursor)
        })
        app.post('/packages', async (req,res)=>{
            const data = req.body;
            const result = await packagesCollection.insertOne(data);
            res.send(result);
        })
        app.post('/post-review', async(req, res) => {
            const postData = req.body;
            const result = await reviewsCollection.insertOne(postData);
            res.send(result)

        })
        app.get('/post-review/:id', async (req, res)=> {
            const id = req.params.id
            const query = {packageId: id}
            const cursor = reviewsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        app.delete('/post-review/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id : ObjectId(id)}
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
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