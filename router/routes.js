const express = require('express');
const router = express.Router();

const { newUser, userList, deleteUser } = require('../handlers/UserHandler');

router.post('/newuser', newUser);
router.get('/userlist', userList);
router.delete('/deleteUser/:username', deleteUser);

module.exports = router;