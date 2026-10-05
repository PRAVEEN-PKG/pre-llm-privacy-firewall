const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    policies: [
      {
        id: 'strict',
        name: 'Strict',
        description: 'Protect all detected sensitive information'
      },
      {
        id: 'balanced',
        name: 'Balanced',
        description: 'Protect high-risk sensitive information'
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Protect only critical information'
      }
    ]
  });
});

module.exports = router;
