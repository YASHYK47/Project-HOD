require('./config/config.js');
const express=require('express');

var app=express();
const bodyParser=require('body-parser');

//app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
const port=process.env.PORT||3000;
const router=require('./routes/myroutes.js');
app.use(router)

app.listen(port,()=>{
  console.log(`Started up at port:${port}`);
});
module.exports={
app
};
