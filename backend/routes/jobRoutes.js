const router = require('express').Router();  
const { protect, restrictTo } = require('../middleware/auth');  
const c = require('../controllers/jobController');
const { getNextOrderNumber } = require('../controllers/jobController');

router.use(protect);  
router.get('/', c.getJobs);  
router.post('/', restrictTo('admin'), c.createJob);  
router.patch('/:id/status', restrictTo('admin', 'designer', 'printer'), c.updateStatus);  
router.patch('/:id/delivery', restrictTo('delivery'), c.updateDelivery);  
router.patch(
'/:id/delivery-status',
restrictTo('delivery'),
c.updateDeliveryStatus
);
router.get('/next-order-number', auth, getNextOrderNumber);
module.exports = router;  