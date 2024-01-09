const { Router } = require('express');
const userRouter = require('./modules/user/user.route');
const blogRouter = require('./modules/blog/blog.route');

const router = Router();

router.use('/blogs', blogRouter);
router.use('/users', userRouter);

router.get('/', (req, res) => res.sendStatus(200));
router.all('*', (req, res) => res.sendStatus(404));

module.exports = router;
