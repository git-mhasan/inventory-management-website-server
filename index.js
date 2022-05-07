const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("unauthorized access!");
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send("Forbidden")
        }
        req.decoded = decoded;
        console.log(decoded);
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1moqz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('greenTechDB').collection("products");

        //Insert Product
        app.post('/product', async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await productCollection.insertOne(product);
            res.send(result);
        })

        //Delete an item
        app.delete("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })
        // Update a Product
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const newProduct = req.body;
            // console.log(newProduct);
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true }
            const updatedProduct = {
                $set: {
                    quantity: newProduct.quantity,
                    sold: newProduct.sold
                }
            };
            const result = await productCollection.updateOne(filter, updatedProduct, option);
            res.send(result);
        });

        // Get all products
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
            // console.log({ products });
        });

        app.get('/product', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded?.email;
            const email = req.query.email;
            if (!!email === true && decodedEmail === email) {
                const query = { manager: email }
                const cursor = productCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            }

            // console.log({ products });
        });
        // Get product by ID
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        // Auth Api
        app.post("/login", async (req, res) => {
            const email = req.body;
            const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send(accessToken);
        })

    }
    catch {
        console.error('connection interupted');
    }
    finally {
        // client.close();
        console.log({ connection: "closed" });
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send('server is running.');
})
app.listen(port, () => {
    console.log("listening to port: ", port);
})