const Joi = require('joi');
const mongoose = require('mongoose');

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const createAssignmentSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().allow('', null).max(2000),
  instructions: Joi.string().allow('', null).max(2000),
  course: Joi.string().custom(objectId).required(),
  faculty: Joi.string().custom(objectId).required(),
  dueDate: Joi.date().required(),
  maxMarks: Joi.number().min(0).required(),
  submissionType: Joi.string().valid('text', 'file', 'both').default('both'),
  // attachment fields are optional metadata strings
  attachment: Joi.object({
    filename: Joi.string().optional(),
    mimeType: Joi.string().optional(),
    size: Joi.number().optional(),
    url: Joi.string().uri().optional(),
  }).optional(),
  published: Joi.boolean().default(false),
});

const updateAssignmentSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  description: Joi.string().allow('', null).max(2000),
  instructions: Joi.string().allow('', null).max(2000),
  dueDate: Joi.date(),
  maxMarks: Joi.number().min(0),
  submissionType: Joi.string().valid('text', 'file', 'both'),
  attachment: Joi.object({
    filename: Joi.string().optional(),
    mimeType: Joi.string().optional(),
    size: Joi.number().optional(),
    url: Joi.string().uri().optional(),
  }),
  published: Joi.boolean(),
});

module.exports = { createAssignmentSchema, updateAssignmentSchema };
