const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,

    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0){
                throw new Error ('Age can\'t be Negative')
            }
        }

    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        validate(value) {
            if(value.includes('password')){
                throw new Error ('Password can\'t contains password')
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Invalid Mail')
            }
        }
    },
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const users = this
    const userObject = users.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject

}


userSchema.methods.generateToken = async function (){
    const user = this
    const token = await jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })

    await user.save()
    
    return token
}

userSchema.statics.findByCredentials = async (email,password) => {
    const users = await Users.findOne({email: email})
    if(!users){
        throw new Error('This Email id is not register with us')
    }
    const isMatch = await bcrypt.compareSync(password,users.password)
    if(!isMatch){
        throw new Error('Email id and password doesn\'t match ')
    }
    return users
}

userSchema.pre('save', async function(next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hashSync(user.password, 8)
    }
    

    next()
})

//Delete user Task when user remove

userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const Users = mongoose.model('Users',userSchema)

module.exports = Users