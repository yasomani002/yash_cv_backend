const mongoose = require('mongoose');
const bycrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
 email:{
    type:String,
    required:[true,'Email is required'],
    unique:true
 },
 password:{
    type:String,
    required:[true,'Password is required'],
      minlength:6
 },
 isVerified:{
    type:Boolean,
    default:false
 },
 otp:{
    type:String,
    default:null
 },
 isLoggedIn:{
    type:Boolean,
    default:false
 }
})


userSchema.pre('save', async function(next) {
    try {
        const userData = this;
        if(!userData.isModified('password')) return next();

        // Hash the password before saving
        const salt = await bycrypt.genSalt(10);
        const hashpassword = await bycrypt.hash(userData.password,salt);
        userData.password = hashpassword;
        next();
    } catch (error) {
        next(error)       
    }
})


userSchema.methods.comparePassword = async function(userPassword){
    try{
        const isMatch = await bycrypt.compare(userPassword,this.password)
        return isMatch;
    }catch(error){
        throw new Error(error);
    }
}

const User = mongoose.model('User',userSchema)
module.exports = User
