const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const objectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Middleware

app.use(cors());
app.use(express.json());

// Database  Code 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mc60i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('car-valley');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const userReviewsCollection = database.collection('userReviews');

        // Get All products
        app.get('/products', async (req, res) => {
            console.log('Get All Products');
            const result = await productsCollection.find({}).toArray();
            res.json(result);
        })
        // get specific products
        app.get('/products/:id', async (req, res) => {
            console.log('get single product')
            const id = req.params.id;
            const query = { _id: objectId(id) };
            console.log(query);
            const result = await productsCollection.findOne(query);
            console.log(result);
            res.json(result);
        })
        // Add new product
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await productsCollection.insertOne(newProduct);
            console.log(result);
            res.json(result);
        })

        // Remove specific products
        /*         app.delete('/products/:id', (req, res) => {
        
                }); */

        // add a Order
        app.post('/orders', async (req, res) => {
            console.log('add Orders')
            const newOrder = req.body;
            console.log(newOrder);
            const result = await ordersCollection.insertOne(newOrder);
            console.log(result);
            res.json(result);
        });


        // get order by specific user vai email
        app.get('/orders/:email', async (req, res) => {
            console.log('get order by email');
            const email = req.params.email;
            const query = { email: email };
            console.log(query);
            const result = await ordersCollection.find(query).toArray();
            res.json(result);
        });

        // get all orders
        app.get('/orders', async (req, res) => {
            console.log('get all orders');
            const result = await ordersCollection.find({}).toArray();
            res.json(result);
        });

        // add user
        app.post('/users', async (req, res) => {
            console.log('body')
            const newUser = req.body;
            console.log(newUser);
            const result = await usersCollection.insertOne(newUser);
            console.log(result);
            res.json(result);

        });

        // Check if user exists or does not exist Add user if user does not exist
        app.put('/users', async (req, res) => {
            console.log('update user')
            const user = req.body
            const filter = { email: user?.email };
            const updateDoc = { $set: user };
            const options = { upsert: true };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // Make Admin user
        app.put('/users/makeAdmin', async (req, res) => {
            const user = req.body;
            const filter = { email: user?.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // check if user is admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await usersCollection.findOne(query);
            let isAdmin = false;
            if (result?.role === 'admin') {
                isAdmin = true;
            }
            console.log(isAdmin);
            res.send(isAdmin);
        })

        // add a Review 
        app.post('/reviews', async (req, res) => {
            console.log('add review');
            const review = req.body;
            const result = await userReviewsCollection.insertOne(review);
            console.log(result);
            res.json(result);
        })

        // get all Review
        app.get('/reviews', async (req, res) => {
            console.log('get all reviews');
            const result = await userReviewsCollection.find({}).toArray();
            console.log(result);
            res.json(result);
        });

        // shiped order
        app.put('/orders/:id', async (req, res) => {
            console.log('shiped order');
            const id = req.params.id;

            const query = { _id: objectId(id) };
            const updateDoc = { $set: { status: 'shipped' } };
            const result = await ordersCollection.updateOne(query, updateDoc);
            console.log(result);
            res.json('result');
        });

        // Delete order
        app.delete('/orders/:id', async (req, res) => {
            console.log('delete order');
            const id = req.params.id;
            const query = { _id: objectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log(result);
            res.json(result);
        });




    } catch {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("your car-valley server Running");
})
app.listen(port, (req, res) => {
    console.log('Listening on port', port);
})