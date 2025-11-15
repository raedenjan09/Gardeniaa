const mongoose = require('mongoose')

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter supplier name'],
        trim: true,
        maxLength: [100, 'Supplier name cannot exceed 100 characters'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please enter supplier email'],
        unique: true,
        validate: {
            validator: function(email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: 'Please enter a valid email'
        }
    },
    phone: {
        type: String,
        required: [true, 'Please enter supplier phone number'],
        maxLength: [15, 'Phone number cannot exceed 15 characters']
    },
    address: {
        street: {
            type: String,
            required: [true, 'Please enter street address']
        },
        city: {
            type: String,
            required: [true, 'Please enter city']
        },
        state: {
            type: String,
            required: [true, 'Please enter state']
        },
        country: {
            type: String,
            required: [true, 'Please enter country']
        },
        zipCode: {
            type: String,
            required: [true, 'Please enter zip code']
        }
    },

    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Update the updatedAt field before saving
supplierSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Supplier', supplierSchema);