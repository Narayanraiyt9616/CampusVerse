const mongoose = require('mongoose');
const { Schema } = mongoose;

const facultySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  department: { type: String },
  position: { type: String },
  // Assigned entities
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  semesters: [{ type: Number }],
  sections: [{ type: String }],
  // Permissions
  permissions: {
    attendance: { type: Boolean, default: false },
    assignments: { type: Boolean, default: false },
    materials: { type: Boolean, default: false },
    examinations: { type: Boolean, default: false },
    marks: { type: Boolean, default: false },
    questionPapers: { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
