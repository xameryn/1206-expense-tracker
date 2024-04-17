const ExpenseModel = require('../models/expense');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

const CreateExpense = async (req, res) => {
    const allHeaders = req.headers;

    if (!allHeaders.authorization) {
        res.status(401).json({
            message: "Please provide the token",
            message: err.message
        });
    }

    const token = allHeaders.authorization;
    const decodedToken = jwt.decode(token, { complete: true});
    const userId = decodedToken.payload.id;
    const userExists = await UserModel.findOne({ _id: userId });

    if (!userExists) {
        res.status(401).json({
            message: "You are not authorized to create an expense!",
            message: err.message
        });
    }

    const expenseBody = req.body;

    const newExpense = new ExpenseModel({
        name: expenseBody.name,
        description: expenseBody.description,
        amount: expenseBody.amount,
        date: expenseBody.date,
        category: expenseBody.category,
        user: userId
    })

    const savedExpense = await newExpense.save();

    return res.status(201).json({
        message: "Expense Created Succesfully!",
        data: savedExpense
    })
}

const ModifyExpense = async (req, res) => {
}

const RemoveExpense = async (req, res) => {
    const allHeaders = req.headers;

    if (!allHeaders.authorization) {
        return res.status(401).json({
            message: "Please provide the token",
        });
    }

    const token = allHeaders.authorization;
    const decodedToken = jwt.decode(token, { complete: true });
    const userId = decodedToken.payload.id;
    const userExists = await UserModel.findOne({ _id: userId });

    if (!userExists) {
        return res.status(401).json({
            message: "You are not authorized to remove an expense!",
        });
    }

    const expenseId = req.params.id; // Assuming the expense id is passed as a URL parameter

    const expense = await ExpenseModel.findOne({ _id: expenseId, user: userId });

    if (!expense) {
        return res.status(404).json({
            message: "Expense not found",
        });
    }

    await ExpenseModel.deleteOne({ _id: expenseId });

    return res.status(200).json({
        message: "Expense removed successfully",
    });
}

const GetExpenses = async (req, res) => {
    const allHeaders = req.headers;

    if (!allHeaders.authorization) {
        return res.status(401).json({
            message: "Please provide the token"
        });
    }

    const token = allHeaders.authorization;

    if (token == null) {
        return res.status(401).json({
            message: "Token is missing",
        });
    }

    const decodedToken = jwt.decode(token, { complete: true });

    if (!decodedToken) {
        return res.status(401).json({
            message: "Invalid token",
        });
    }

    const userId = decodedToken.payload.id;
    const userExists = await UserModel.findOne({ _id: userId });

    if (!userExists) {
        return res.status(401).json({
            message: "You are not authorized to view expenses!"
        });
    }

    const expenses = await ExpenseModel.find({ user: userId });

    return res.status(200).json({
        message: "Expenses retrieved successfully!",
        data: expenses
    });
}

module.exports = {
    CreateExpense,
    ModifyExpense,
    RemoveExpense,
    GetExpenses
}