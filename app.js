var express = require('express');
require('./mongoose.js');

// user router import
const userRouter = require('./routers/user.js');

var app = express();
var port = 3000;

//setting up template engine
app.set('view engine', 'ejs');

//static files
app.use(express.static('./public'));

// for json
app.use(express.json());

// userRouter
app.use(userRouter);

app.listen(port, () => {
    console.log('Server listening to: ' + port);
})