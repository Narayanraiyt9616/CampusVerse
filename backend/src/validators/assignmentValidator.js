const Joi = require('joi');
const mongoose = require('mongoose');

const objectId = (value, helpers) => {
  if (!value) return value;
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const mcqQuestionSchema = Joi.object({
  _id: Joi.any().optional(),
  questionText: Joi.string().trim().required(),
  options: Joi.array().items(Joi.string().allow('')).min(2).required(),
  correctAnswer: Joi.number().min(0).required(),
  marks: Joi.number().min(0.1).default(1),
  explanation: Joi.string().allow('', null).optional(),
});

const createAssignmentSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().allow('', null).max(2000),
  instructions: Joi.string().allow('', null).max(2000),
  subject: Joi.string().allow('', null).max(200),
  course: Joi.any().optional(),
  faculty: Joi.any().optional(),
  dueDate: Joi.date().required(),
  maxMarks: Joi.number().min(0).optional(),
  assignmentType: Joi.string().valid('mcq', 'pdf', 'text', 'both', 'MCQ', 'PDF').default('mcq'),
  questions: Joi.array().items(mcqQuestionSchema).optional(),
  questionPaper: Joi.object().optional(),
  requiresPdfSubmission: Joi.boolean().default(true),
  targetClass: Joi.string().allow('', null).max(100),
  targetSemester: Joi.number().allow(null).optional(),
  targetSection: Joi.string().allow('', null).max(50),
  submissionType: Joi.string().valid('text', 'file', 'both', 'mcq', 'pdf', 'MCQ', 'PDF').default('both'),
  attachment: Joi.object({
    filename: Joi.string().optional(),
    mimeType: Joi.string().optional(),
    size: Joi.number().optional(),
    url: Joi.string().uri().optional(),
  }).optional(),
  published: Joi.boolean().default(true),
});

const updateAssignmentSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  description: Joi.string().allow('', null).max(2000),
  instructions: Joi.string().allow('', null).max(2000),
  subject: Joi.string().allow('', null).max(200),
  course: Joi.any().optional(),
  dueDate: Joi.date(),
  maxMarks: Joi.number().min(0),
  assignmentType: Joi.string().valid('mcq', 'pdf', 'text', 'both', 'MCQ', 'PDF'),
  questions: Joi.array().items(mcqQuestionSchema),
  questionPaper: Joi.object(),
  requiresPdfSubmission: Joi.boolean(),
  targetClass: Joi.string().allow('', null).max(100),
  targetSemester: Joi.number().allow(null),
  targetSection: Joi.string().allow('', null).max(50),
  submissionType: Joi.string().valid('text', 'file', 'both', 'mcq', 'pdf', 'MCQ', 'PDF'),
  attachment: Joi.object({
    filename: Joi.string().optional(),
    mimeType: Joi.string().optional(),
    size: Joi.number().optional(),
    url: Joi.string().uri().optional(),
  }),
  published: Joi.boolean(),
});

module.exports = { createAssignmentSchema, updateAssignmentSchema };

