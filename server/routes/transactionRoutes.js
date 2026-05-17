const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/categories/list', getCategories);

router.route('/')
  .get(getTransactions)
  .post([
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
  ], createTransaction);

router.route('/:id')
  .get(getTransaction)
  .put([
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Invalid type'),
  ], updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
