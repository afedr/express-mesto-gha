const Card = require('../models/card');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');

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

module.exports.getCard = (req, res, next) => {
  Card.find({})
    .then((card) => res.send(card))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
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
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорретные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => Card.findByIdAndUpdate(
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
  .catch((err) => {
    if (err.message === 'NotFound') {
      next(new NotFoundError('Передан неверный id карточки'));
    } else if (err.name === 'CastError') {
      next(new ValidationError('Переданы некорретные данные'));
    } else {
      next(err);
    }
  });

module.exports.dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
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
  .catch((err) => {
    if (err.message === 'NotFound') {
      next(new NotFoundError('Передан несуществующий id карточки'));
    } else if (err.name === 'CastError') {
      next(new ValidationError('Переданы некорретные данные'));
    } else {
      next(err);
    }
  });
