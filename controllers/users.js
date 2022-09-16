const User = require('../models/user');

const VALIDATION_ERROR_CODE = 400;
const DEFAULT_ERROR_CODE = 500;
const NOTFOUND_ERROR_CODE = 404;

function processError(err, res) {
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
  User.findById(req.params._id)
    .then((user) => {
      if (!user) {
        return res.status(NOTFOUND_ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.send(user);
    })
    .catch((err) => processError(err, res));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send(user))
    .catch((err) => processError(err, res));
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
