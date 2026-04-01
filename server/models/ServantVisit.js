import mongoose from 'mongoose';

const servantVisitSchema = new mongoose.Schema({
  servantId: {
    type: Number,
    required: true
  },
  visitorIp: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Create a unique index for servantId and visitorIp to prevent duplicate visits
servantVisitSchema.index({ servantId: 1, visitorIp: 1 }, { unique: true });

const ServantVisit = mongoose.model('ServantVisit', servantVisitSchema);

export default ServantVisit;
