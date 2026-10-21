const Joi = require('joi');
const mongoose = require('mongoose');

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const createResultSchema = Joi.object({
  student: Joi.string().custom(objectId).required(),
  course: Joi.string().custom(objectId).required(),
  faculty: Joi.string().custom(objectId).required(),
  assessmentName: Joi.string().trim().min(1).max(100).required(),
  assessmentType: Joi.string().valid('Exam','Quiz','Assignment','Project','Other').default('Exam'),
  maxMarks: Joi.number().min(0).required(),
  marksObtained: Joi.number().min(0),
  semester: Joi.number().integer().min(1).max(12).required(),
  session: Joi.string().trim().required(),
  published: Joi.boolean().default(false),
  feedback: Joi.string().allow('', null).max(1000),
});

const updateResultSchema = Joi.object({
  marksObtained: Joi.number().min(0),
  published: Joi.boolean(),
  feedback: Joi.string().allow('', null).max(1000),
});

module.exports = { createResultSchema, updateResultSchema };
