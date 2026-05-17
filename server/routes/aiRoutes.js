const express = require('express');
const router = express.Router();
const {
  getInsights,
  getBudgetPlan,
  chat,
  getMonthlyReport,
  predictSpendingPatterns,
  detectUnusualExpenses,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/insights', getInsights);
router.get('/budget-plan', getBudgetPlan);
router.post('/chat', chat);
router.get('/monthly-report', getMonthlyReport);
router.get('/predict', predictSpendingPatterns);
router.get('/anomalies', detectUnusualExpenses);

module.exports = router;
