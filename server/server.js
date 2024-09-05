const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser')

const app = express();
const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Connect to MongoDB
const URI = process.env.MONGODBURL;

app.get('/',(req,res)=>{
    res.json({msg:"great things are on the way..."})
})

app.use(express.json())             
app.use(cookieParser())

app.use('/user',require('./routes/userRoutes'))

mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected');
})
.catch(error => {
    console.log(error);
});
