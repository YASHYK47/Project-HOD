var {Admin}=require('../models/admin.js');

var authenticateadmin=(req,res,next)=>{
  var token=req.header('x-auth');
  Admin.findByToken(token).then((user)=>{
    if(!user){
      return Promise.reject();
    }
    req.user=user;
    req.token=token;
    next();
  }).catch((e)=>{
    res.status(401).send();
  });
}
module.exports={
  authenticateadmin
};
