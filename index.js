const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q37bxqk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Verify JWT
function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const packagesCollection = client.db("tour").collection("packages")
        const reviewsCollection = client.db("tour").collection("reviews")
        app.get('/home', async (req, res) => {
            const query = {};
            const cursor = packagesCollection.find(query).sort({insertTime: -1}).limit(3);
            const allData = await cursor.toArray();
            res.send(allData);
        })
        app.post('/jwt', (req, res)=> {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5d' });
            res.send({token})

        })
        app.get('/packages', async (req, res) => {
            const query = {};
            const cursor = packagesCollection.find(query).sort({insertTime: -1});
            const allData = await cursor.toArray();
            res.send(allData);
        })
        app.get('/added-services', async (req, res) => {
            let query = {};
            if(req.query.email){
                query = {email: req.query.email}
            }
            const cursor = packagesCollection.find(query).sort({insertTime: -1});
            const allData = await cursor.toArray();
            res.send(allData);
        })
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cursor = await packagesCollection.findOne(query);
            res.send(cursor)
        })
        app.post('/services', verifyJWT, async (req, res) => {
            const data = req.body;
            const result = await packagesCollection.insertOne(data);
            res.send(result);
        })
        app.post('/post-review', async (req, res) => {
            const postData = req.body;
            const result = await reviewsCollection.insertOne(postData);
            res.send(result)

        })
        app.get('/post-review/:id', async (req, res) => {
            
            const id = req.params.id
            const query = { packageId: id }
            const cursor = reviewsCollection.find(query).sort({insertTime: -1});
            const result = await cursor.toArray();
            res.send(result)
        })
        app.delete('/post-review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })
        app.get('/edit-comment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.findOne(query)
            res.send(result)
        })
        app.put('/edit-comment/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body;
            const query = {_id : ObjectId(id)};;
            const updatedDoc = {
                $set:{
                    comments: status.updateComment
                }
            }
            const result = await reviewsCollection.updateOne(query, updatedDoc);
            res.send(result)
        })
        app.get('/my-review', verifyJWT, async(req,res) => {
          
            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }
            let query = {};
            if(req.query.email){
                query = {email: req.query.email}
            }
            const cursor = reviewsCollection.find(query).sort({insertTime: -1});
            const result = await cursor.toArray()
            res.send(result);


        })
    }
    finally {
    }
}
run().catch(e => console.log(e.message))

app.get('/', (req, res) => {
    res.send('Hello World!')
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})