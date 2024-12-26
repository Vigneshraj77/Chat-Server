const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

// Load input validat
// Load User model
const User = require("../../models/UserSchema");
// @route POST api/users/register
// @desc Register user
// @access Public

router.post("/register", (req, res,next) => {
try{
    User.findOne({email:req.body.email}).then(user=>{
        if(user){
            return res.status(400).json({email:"Email already exists"});
        } else{
            const newUser = new User({
                name:req.body.name,
                password:req.body.password,
                email:req.body.email
            });

            // Hash password before storing in database
            const rounds  = 10;
            bcrypt.genSalt(rounds, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                    .save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
                });
            });
        }

    });
}catch(err){
    return next(err)
}
});


// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public

router.post("/login",(req,res,next) => {

    const email = req.body.email;
    const password = req.body.password;
   
    //Find user by Email
    User.find({}).then((res) => console.log(res))
    User.findOne({email}).then(user=>{
        if(!user){
            return res.status(404).json({ emailnotfound: "Email not found" });
        }


    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
            const name = user.name
            // Create JWT Payload
            const payload = {
                id: user.id,
                name: user.name
            };

            // Sign token
            jwt.sign(
                payload,
                keys.secretOrKey,
                {
                 expiresIn: 31556926 
                },
                (err, token) => {
                res.json({
                    success: true,
                    name: name,
                    token: "Bearer " + token
                });
                }
            );
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      }).catch(e =>  next(e));
    });
});

module.exports = router;