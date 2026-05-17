const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/alerts', getBudgetAlerts);

router.route('/')
  .get(getBudgets)
  .post([
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('limit').isFloat({ min: 1 }).withMessage('Budget limit must be at least 1'),
  ], createBudget);

router.route('/:id')
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;
