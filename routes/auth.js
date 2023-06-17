const express = require('express');
const { check, validationResult } = require('express-validator');
const userSchema = require("../models/UserSchema");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');



router.get('/', async (req, res) => {
    try {
        const users = await userSchema.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// path /auth/createuser
router.post('/createuser', [
    check('name', 'Enter a valid name of minimum of 5 char').isLength({ min: 5 }),
    check('email', 'Enter valid email address').isEmail(),
    check('password', 'Your password must be at least 5 characters long').isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await userSchema.findOne({ email: req.body.email });
        if (user !== null) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // const saltRoute = await bcrypt.genSalt(10);
        const saltRoute = await bcrypt.genSalt();
        const secPassword = await bcrypt.hash(req.body.password, saltRoute);
        const newUser = await userSchema.create({
            name: req.body.name,
            email: req.body.email,
            password: secPassword,
        });
        const payLoad = {
            user: {
                id: newUser.id
            }
        };
        const authToken = jsonwebtoken.sign(payLoad, process.env.JWT_KEY);
        res.status(201).json({ success: true, authtoken: authToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// path /auth/login

router.post('/login', [
    check('email', 'Enter valid email address').isEmail(),
    check('password', 'Your password must be at least 5 characters long').exists(),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        // email
        const user = await userSchema.findOne({ email });
        if (user === null) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // password
        const comparePass = await bcrypt.compare(password, user.password);
        if (!comparePass) {
            success = false
            return res.status(400).json({success, error: "Please login with a valid password" });
        }

        const payLoad = {
            user: {
                id: user.id
            }
        };
        const authToken = jsonwebtoken.sign(payLoad, process.env.JWT_KEY);
        success = true;
        res.status(201).json({success, authtoken: authToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// path /auth/getuser


router.get("/getuser", fetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userSchema.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
