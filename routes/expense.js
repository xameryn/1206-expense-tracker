const express = require('express');
const Router = express.Router();
const ExpenseController = require('../controllers/expense');

Router.post('/', ExpenseController.CreateExpense)
Router.put('/:id', ExpenseController.ModifyExpense);
Router.delete('/:id', ExpenseController.RemoveExpense);
Router.get('/', ExpenseController.GetExpenses);

module.exports = Router;