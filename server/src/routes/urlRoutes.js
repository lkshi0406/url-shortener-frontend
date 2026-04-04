import { Router } from 'express';
import { urlController } from '../controllers/urlController.js';
import { shortenRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/shorten', shortenRateLimiter, urlController.shorten);
router.post('/:shortCode/verify-password', urlController.verifyPassword);
router.get('/:shortCode', urlController.redirect);

export default router;
