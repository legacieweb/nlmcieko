import mongoose from 'mongoose';

const servantCustomizationSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: false,
    unique: true // Reference to Neon DB User ID
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String,
    default: ''
  },
  themeColor: {
    type: String,
    default: '#6366f1'
  },
  displayName: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  vision: {
    type: String,
    default: 'Establishing a world where the water and the Spirit gospel reaches every corner, illuminating hearts with the light of true salvation.'
  },
  dailyWord: {
    type: String,
    default: '"But seek first the kingdom of God and his righteousness, and all these things will be added to you." - Matthew 6:33'
  },
  musicGenrePreference: {
    type: String,
    default: ''
  },
  customWidgets: {
    type: Array,
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const ServantCustomization = mongoose.model('ServantCustomization', servantCustomizationSchema);

export default ServantCustomization;
