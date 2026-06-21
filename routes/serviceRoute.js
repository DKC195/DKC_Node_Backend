const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {createService,getServices,updateService,deleteService} = require('../controllers/serviceController');
const router = express.Router();

router.post('/create', authMiddleware, createService);
router.get('/all', getServices);
router.put('/update/:id', authMiddleware, updateService);
router.delete('/delete/:id', authMiddleware, deleteService);

module.exports = router;