const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Fee category is required'],
      trim: true,
      enum: {
        values: ['Tuition Fee', 'Hostel & Mess', 'Examination Fee', 'Library & IEEE', 'Transport', 'Miscellaneous'],
        message: '{VALUE} is not a valid fee category',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    amount: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: { values: ['Pending', 'Paid', 'Overdue', 'Waived'], message: '{VALUE} is not a valid fee status' },
      default: 'Pending',
    },
    paidAmount: { type: Number, default: 0, min: 0 },
    paymentDate: { type: Date },
    paymentMode: { type: String, enum: ['Online', 'Cash', 'DD', 'Cheque', 'Waived'] },
    receiptNumber: { type: String, trim: true },
    semester: { type: Number, min: 1, max: 12 },
    academicYear: { type: String, trim: true },
    remarks: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => { delete ret.__v; return ret; },
    },
  }
);

feeSchema.index({ student: 1, status: 1 });
feeSchema.index({ student: 1, dueDate: -1 });
feeSchema.index({ status: 1 });
feeSchema.index({ dueDate: 1 });
feeSchema.index({ createdAt: -1 });

const Fee = mongoose.model('Fee', feeSchema);
module.exports = Fee;
