const router = require("./auth");

router.get("/", (req,res)=>{
    req.logout();
    res.send("logged out");
});

module.exports=router;