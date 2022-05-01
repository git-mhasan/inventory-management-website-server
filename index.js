const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/user', (req, res) => {
    res.send({ name: "mahadi", age: 23 });
})

app.listen(port, () => {
    console.log("listening to port: ", port);
})