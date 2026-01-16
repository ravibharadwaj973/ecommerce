import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    required: true,
    default: 'home'
  },
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: 15,
    validate: {
      validator: function(v) {
        return /^[0-9A-Za-z-]+$/.test(v);
      },
      message: 'Zip code can only contain numbers, letters, and dashes'
    }
  },
  country: {
    type: String,
    required: true,
    default: 'US',
    trim: true,
    maxlength: 100
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // creates createdAt and updatedAt automatically
});

// Compound index to ensure only one default address per user
addressSchema.index({ userId: 1, isDefault: 1 }, { 
  unique: true, 
  partialFilterExpression: { isDefault: true } 
});

// Index for efficient queries by user
addressSchema.index({ userId: 1 });

// Pre-save middleware to handle default address logic
addressSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    try {
      // Remove default status from other addresses of this user
      await mongoose.model('Address').updateMany(
        { 
          userId: this.userId, 
          _id: { $ne: this._id } 
        },
        { $set: { isDefault: false } }
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Address =mongoose.models.Address|| mongoose.model('Address', addressSchema);

export default Address;