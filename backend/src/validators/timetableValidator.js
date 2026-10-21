const Joi = require('joi');
const mongoose = require('mongoose');

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const createTimetableSchema = Joi.object({
  department: Joi.string().custom(objectId).required(),
  course: Joi.string().custom(objectId).required(),
  faculty: Joi.string().custom(objectId).required(),
  semester: Joi.number().integer().min(1).max(12).required(),
  section: Joi.string().trim().required(),
  dayOfWeek: Joi.string()
    .valid('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')
    .required(),
  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid start time format' }),
  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid end time format' }),
  classroom: Joi.string().trim().required(),
  session: Joi.string().trim().required(),
}).custom((obj, helpers) => {
  // ensure start < end
  const [sh, sm] = obj.startTime.split(':').map(Number);
  const [eh, em] = obj.endTime.split(':').map(Number);
  if (eh < sh || (eh === sh && em <= sm)) {
    return helpers.error('any.invalid', { message: 'Start time must be before end time' });
  }
  return obj;
});

const updateTimetableSchema = Joi.object({
  semester: Joi.number().integer().min(1).max(12),
  section: Joi.string().trim(),
  dayOfWeek: Joi.string().valid('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  classroom: Joi.string().trim(),
  session: Joi.string().trim(),
}).custom((obj, helpers) => {
  if (obj.startTime && obj.endTime) {
    const [sh, sm] = obj.startTime.split(':').map(Number);
    const [eh, em] = obj.endTime.split(':').map(Number);
    if (eh < sh || (eh === sh && em <= sm)) {
      return helpers.error('any.invalid', { message: 'Start time must be before end time' });
    }
  }
  return obj;
});

module.exports = { createTimetableSchema, updateTimetableSchema };
