const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const bodyperser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;




// --middlewares
app.use(cors({
    // https://midgenerationcoders.web.app
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(express.json());
app.use(bodyperser.json());




const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.38hce1z.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const Servicedb = client.db('MidGenerationCoderDB').collection('Services');
        const Userdb = client.db('MidGenerationCoderDB').collection('Users')

        app.get('/services', async (req, res) => {
            const result = await Servicedb.find().toArray();

            res.send(result)
        })


        app.post('/user', async (req, res) => {
            const user = req?.body;
            const query = { "user_email": user?.user_email }
            const exist = await Userdb.findOne(query);
            if (exist) {
                return res.send({ message: "Already Exist email !" })
            }
            const result = await Userdb.insertOne(user);
            res.send(result);
        })

















        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {

        console.log(error)

    }
}
run()




app.get('/', (req, res) => {

    res.send('MidGeneration_coders server is Running !')

})


app.listen(port, () => {
    console.log(`MidGeneration_coders server is running on port ${port}`)
})