const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const bodyperser = require('body-parser');
const cors = require('cors');
const cookieparser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;




// --middlewares
app.use(cors({
    // https://midgenerationcoders.web.app
    // http://localhost:5173
    origin: 'https://midgenerationcoders.web.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));


app.use(express.json());
app.use(bodyperser.json());
app.use(cookieparser());

const verifiedToken = (req, res, next) => {
    const Token = req?.cookies?.Token;
    if (!Token) {
        return res.status(401).send({ message: 'unauthorized user' })
    }
    jwt.verify(Token, process.env.ACCESS_TOKEN, (error, decoded) => {
        if (error) {
            return res.status(401).send({ message: 'unauthorized user' })
        }
        else {
            req.user = decoded;
            next();
        }
    })




}





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
        const Userdb = client.db('MidGenerationCoderDB').collection('Users');
        const Employeedb = client.db('MidGenerationCoderDB').collection('Employees');
        const paymentInfodb = client.db('MidGenerationCoderDB').collection('payments')

        // ----PAYMENT-RELATED-API--
        app.post('/create-prement-intent', async (req, res) => {
            const { salary } = req?.body;
            const parseSalary = parseInt(salary * 100);

            const paymentintent = await await stripe.paymentIntents.create({
                amount: parseSalary,
                currency: "usd",
                payment_method_types: ['card']

            })
            res.send({
                clientSecret: paymentintent.client_secret,
            });


        })

        // ---Token-related-apis---

        app.post('/jwtToken', async (req, res) => {
            const user = req?.body;

            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })

            res.cookie('Token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',


            }).send({ success: true });
        })

        app.post('/jwtTokenClear', async (req, res) => {

            res.clearCookie('Token', { maxAge: 0 }).send({ 'Token clear': 'successfull' })
        })



        //    ----from-the--database-data-related-api---
        app.get('/services', async (req, res) => {
            const result = await Servicedb.find().toArray();

            res.send(result)
        })

        app.get('/employes', verifiedToken, async (req, res) => {
            const result = await Employeedb.find().toArray();
            res.send(result);
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


        app.patch('/employes', async (req, res) => {
            const data = req?.body;
            const filter = { 'employeeEmail': data?.employe_email };
            const updateDoc = {
                $set: {
                    "verified": data?.verified
                }
            };


            const result = await Employeedb.updateOne(filter, updateDoc);

            res.send(result);
        })


        app.delete('/employes', async (req, res) => {
            const id = req?.query?.ID;
            const query = { _id: new ObjectId(id) }
            const result = await Employeedb.deleteOne(query);

            res.send(result);
        })


        app.post('/paymentInfo', async (req, res) => {
            const payinfo = req?.body;
            const result = await paymentInfodb.insertOne(payinfo)
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