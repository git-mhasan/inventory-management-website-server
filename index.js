const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

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
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
            // console.log({ products });
        });

        // Get product by ID
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            // const products = await cursor.toArray();
            res.send(product);
            // console.log({ products });
        });

    }
    catch {
        console.error('connection interupted');
    }
    finally {
        client.close();
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