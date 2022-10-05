const Card = require('../models/card');

const VALIDATION_ERROR_CODE = 400;
const DEFAULT_ERROR_CODE = 500;
const NOTFOUND_ERROR_CODE = 404;

function processError(err, res) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(VALIDATION_ERROR_CODE).send({ message: 'Ошибка валидации данных' });
  }
  if (err.name === 'CardNotFound') {
    return res.status(NOTFOUND_ERROR_CODE).send({ message: 'Запрашиваемая карточка не найдена' });
  }
  return res.status(DEFAULT_ERROR_CODE).send({ message: 'На сервере произошла ошибка' });
}

module.exports.getCard = (req, res) => {
  Card.find({})
    .then((card) => res.send(card))
    .catch((err) => processError(err, res));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => processError(err, res));
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        return res.status(NOTFOUND_ERROR_CODE).send({ message: 'Запрашиваемая карточка не найдена' });
      }
      console.log(card.owner, req.user._id);
      if (String(card.owner) !== String(req.user._id)) {
        const err = new Error('Попытка удалить чужую карточку');
        err.statusCode = 403;

        return next(err);
      }
      return card.remove()
        .then(() => res.send({ message: 'Карточка успешно удалена' }));
    })
    .catch((err) => processError(err, res));
};

module.exports.likeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .orFail(() => {
    const error = new Error();
    error.name = 'CardNotFound';
    throw error;
  })
  .then((card) => {
    res.send(card);
  })
  .catch((err) => processError(err, res));

module.exports.dislikeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .orFail(() => {
    const error = new Error();
    error.name = 'CardNotFound';
    throw error;
  })
  .then((card) => {
    res.send(card);
  })
  .catch((err) => processError(err, res));
