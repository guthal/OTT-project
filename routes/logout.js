const router = require("./auth");

router.get("/",(req,res)=>{
    req.logout();
    res.send("Logged Out");
});

module.exports=router;