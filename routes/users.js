const router = require('express').Router();
const {
  getUsers,
  getUserId,
  createUser,
  updateProfile,
  updateAvatar,
  getMe,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getMe);
router.get('/users/:userId', getUserId);
// router.post('/users', createUser);



router.patch('/users/me', updateProfile);
router.patch('/users/me/avatar', updateAvatar);

module.exports = router;
