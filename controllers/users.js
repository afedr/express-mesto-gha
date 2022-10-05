const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const VALIDATION_ERROR_CODE = 400;
const DEFAULT_ERROR_CODE = 500;
const NOTFOUND_ERROR_CODE = 404;

function processError(err, res) {
  console.log(err);
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(VALIDATION_ERROR_CODE).send({ message: 'Ошибка валидации данных' });
  }
  return res.status(DEFAULT_ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
}

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((user) => res.send(user))
    .catch((err) => processError(err, res));
};

module.exports.getUserId = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(NOTFOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.send(user);
    })
    .catch((err) => processError(err, res));
};

module.exports.getMe = (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        return res.status(NOTFOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.send(user);
    })
    .catch((err) => processError(err, res));
};

module.exports.createUser = (req, res, next) => {
  console.log(req.body)
  const {
    name, about, avatar, email, password } = req.body;

  if (!email || !password) {
    const err = new Error('Отсутствует email или пароль');
    err.statusCode = 400;

    return next(err);
  }

  // console.log(name, about, avatar, email, password)
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send(user))
    .catch((err) => processError(err, res));
  console.log("finished creating user")
};


module.exports.updateProfile = (req, res) => {
  User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  })
    .then((user) => res.send(user))
    .catch((err) => processError(err, res));
};

module.exports.updateAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  })
    .then((user) => res.send(user))
    .catch((err) => processError(err, res));
};


module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', {
        expiresIn: '7d',
      });
      return res.send({ token });
    })
    .catch((err) => processError(err, res));
};

