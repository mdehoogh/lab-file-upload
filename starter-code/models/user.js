const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

// MDH: username is required, with minimum length 1; profile_pic is a profile img string
const UserSchema = Schema({
  username   : {type:String,minlength:1,required:[true,"A user name is required!"]},
  email      : String,
  password   : String,
  profile_img: String
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
