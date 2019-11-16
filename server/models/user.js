const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var Userschema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Why no name"],
    minlength: 4
  },
  email: {
    type: String,
    required: [true, "Field Necessary"],
    minlength: 8,
    trim: true,
    unique: true,
    validate: {
      validator: value => {
        return validator.isEmail(value);
      },
      message: "{VALUE} is not a valid email"
    }
  },
  parentName: {
    type: String,
    required: [true, "Why no name"],
    minlength: 4
  },
  age: {
    type: Number,
    required: [true, "Field Necessary"],
    minlength: 1
  },
  password: {
    type: String,
    required: [true, "Field Necessary"],
    minlength: 8
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});
Userschema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ["_id", "name", "email", "age", "parentName"]);
};
Userschema.methods.generateAuthToken = function() {
  var user = this;
  var access = "auth";
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET)
    .toString();
  user.tokens.push({ access, token });
  return user.save().then(() => {
    return token;
  });
};

Userschema.methods.removeToken = function(token) {
  var user = this;
  return user.update({
    $pull: {
      tokens: { token }
    }
  });
};
Userschema.statics.findByToken = function(token) {
  var user = this;
  var decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }
  return user.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

Userschema.statics.findByCredentials = function(email, password) {
  var Users = this;
  return Users.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

Userschema.pre("save", function(next) {
  var user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});
var User = mongoose.model("User", Userschema);
module.exports = {
  User
};
