const express = require('express');
const app = express();
const bodyperser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;




// --middlewares
app.use(cors())
app.use(express.json());
app.use(bodyperser.json());





app.get('/', (req, res) => {

    res.send('MidGeneration_coders server is Running !')

})


app.listen(port, () => {
    console.log(`MidGeneration_coders server is running on port ${port}`)
})