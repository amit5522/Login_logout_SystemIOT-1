const express=require('express');

const app=express();
 


const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cors=require('cors');

app.use(cors({
    //credentials: true,
    origin:"*"
//['http://localhost:4200','http://localhost:3000'],
   
   
}));

//middleware parses incoming requests with JSON
app.use(express.urlencoded({extended:false}));
app.use(express.json({limit: '50mb'}));



//user route setup
const user_router = require('./router/user_route');
app.use('/api/v1',user_router);
//device router
const device_router=require('./router/device_router');
app.use('/api/v1',device_router);

app.get('*',(req,res)=>{
    res.status(201).json({
        success:true,
        message:"Runing fine"
    })
})







module.exports=app;