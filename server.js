const express = require('express')
const bodyParser = require("body-parser");
const session = require("express-session");
var userRoute = require('./routes/userRoutes')
const app = express()
app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: false
}));
var dbconnection = require('./db')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/api/users/',userRoute)



const port = 8000


app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(port, () => console.log(`Node JS Server Started`));