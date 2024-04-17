const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT =  process.env.PORT;

err400 = [ 'Email, Password or name missing!' ]
err401 = [ 'Incorrect Credentials', 'User doesn\'t exist', 'Invalid token', 'Malformed token', 'No authorization header', 'You are not authorized to create an expense!', 'Please provide token' ]
err403 = [ 'Email already in use!' ]
err500 = [ 'Error connecting to the database' ]

const UserRoutes = require('./routes/user');
const ExpenseRoutes = require('./routes/expense');

app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {dbName: 'expense_tracker'})
.then(() => {console.log('Connected to the database')})
.catch((error) => {console.error(`Error connecting to the database: ${error}`)})

app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/user', UserRoutes);
app.use('/api/expense', ExpenseRoutes);

app.listen(PORT, () => {console.log(`Server Running at port ${PORT}`)})

app.use((err, req, res, next) => { // error handling
    if (err400.includes(err.message)) { // 400 Bad Request
        res.status(400).json({
            message: err.message
        });
    }
    else if (err401.includes(err.message)) { // 401 Unauthorized
        res.status(401).json({
            message: err.message
        });
    }
    else if (err403.includes(err.message)) { // 403 Forbidden
        res.status(403).json({
            message: err.message
        });
    }
    else if (err500.includes(err.message)) { // 500 Internal Server Error
        res.status(500).json({
            message: err.message
        });
    }
    else {
        next(err);
    }
});