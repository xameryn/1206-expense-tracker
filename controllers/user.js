const UserModel = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const RegisterUser = async (req, res) => {
    const userBody = req.body;

    if (!userBody.email || !userBody.password || !userBody.name) {
        return res.status(400).json({
            message: 'Email, Password or name missing!'
        });
    }

    const userExists = await UserModel.findOne({ email: userBody.email });

    if (userExists) {
        return res.status(400).json({
            message: 'Email already in use!'
        });
    }

    const encryptedPassword = await bcrypt.hash(userBody.password, 10);

    const newUser = new UserModel({
        name: userBody.name,
        email: userBody.email,
        password: encryptedPassword
    })

    try {
        const savedUser = await newUser.save();
        return res.status(201).json({
            message: 'User Registered Succesfully!',
            data: savedUser
        })
    }
    catch (error) {
        return res.status(500).json({
            message: 'There was an error',
            error
        })
    }
}

const GetUsers = async (req, res) => {

    try {
        const users = await UserModel.find();
        return res.status(200).json({
            message: 'Succesfully found the users!',
            data: users
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching users!',
            error
        })
    }
}

const LoginUser = async (req, res) => {
    const userBody = req.body;
    
    if (!userBody.email || !userBody.password) {
        return res.status(400).json({
            message: 'Email, Password or name missing!'
        });
    }

    const userExists = await UserModel.findOne({ email: userBody.email });

    if (!userExists) { // check if the user exists
        return res.status(400).json({
            message: 'User doesn\'t exist'
        });
    }

    if (!await bcrypt.compare(userBody.password, userExists.password)) { // compare the password with the hashed password
        return res.status(401).json({
            message: 'Incorrect Credentials'
        });
    }

    const userData = {
        email: userExists.email,
        name: userExists.name,
        id: userExists._id
    }

    const accessToken = jwt.sign(userData, process.env.JWT_SECRET_KEY);

    userData.token = accessToken;

    return res.status(200).json({
        message: "User Logged in!",
        data: userData
    })
}

const GetUser = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "No authorization header"
        });
    }

    const token = authHeader;

    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return res.status(200).json({
            message: 'User found!',
            data: userData
        });
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            error: error.message
        });
    }
};

module.exports = {
    RegisterUser,
    GetUsers,
    LoginUser,
    GetUser
}