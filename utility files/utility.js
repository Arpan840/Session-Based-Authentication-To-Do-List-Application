const validator = require("validator");
const bcrypt = require("bcrypt");
const env = require("dotenv");
const userModel = require("../Models/userSchema");
const jwt = require("jsonwebtoken");
const { response } = require("express");
const nodemailer = require("nodemailer")
env.config();

const validateUser = ({ name, email, password, age }) => {
  return new Promise((response, reject) => {
    if (!name || !email || !password || !age) {
      reject("All fields are required");
    }
    if (!validator.isEmail(email)) {
      reject("Invalid Email");
    } else if (!validator.isStrongPassword(password)) {
      reject("Week Password");
    }
    if (validator.isEmail(name)) {
      reject("User name should not be in email format");
    } else {
      response();
    }
  });
};

const hashedPassword = async ({ password }) => {
  console.log(password);

  let hashedpass = await bcrypt.hash(password, parseInt(process.env.SALT));
  return hashedpass;
};

function loginValidation(userId) {
  console.log(userId);
  return new Promise(async (response, reject) => {
    if (validator.isEmail(userId)) {
      let user = await userModel.findOne({ email: userId });
      console.log(user, "Test");
      if (user) {
        response(user);
      } else {
        reject("No User Found");
      }
    } else {
      let user = userModel.findOne({ name: userId });
      if (user) {
        response(user);
      } else {
        reject("User not found");
      }
    }
  });
}

function matchPassword(password, hashedPassword) {
  return new Promise(async (resolve, reject) => {
    let verifiedPass = await bcrypt.compare(password, hashedPassword);
    if (verifiedPass) {
      resolve();
    } else {
      reject("Incorrect password");
    }
  });
}

function todoValidation(todo) {
  return new Promise((resolve, reject) => {
    if (todo) {
      resolve();
    } else {
      return reject("Please enter a todo");
    }
  });
}

function updateTodoValidation(id, updateTodo) {
  return new Promise((resolve, reject) => {
    console.log(id, updateTodo, "testtttts");
    if (!id) {
      reject("Please provide valid Id");
    } else if (!updateTodo) {
      reject("No changes to be made");
    } else {
      resolve();
    }
  });
}

function emailAuthintication(userDb) {
  return new Promise((resolve, reject) => {
    if (userDb && !userDb.isEmailAuth) {
      reject("This account is not authenticated by Email");
    }
    resolve();
  });
}

function jwtToken(Email) {
  const token = jwt.sign(Email, process.env.Secret_Key);
  return token;
}

function emailVerification(email,verifiedToken){
  return new Promise((resolve,reject)=>{
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: 'arpandas020498@gmail.com',
        pass: 'nkma tggo tiba snxy'
      }
    });
    var mailOptions = {
      from: 'arpandas020498@gmail.com',
      to: email,
      subject: 'Email verification for todo app',
      html: `<a href="http://localhost:8000/verifyEmail/${verifiedToken}">click to verify </a>`
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        reject(error);
      } else {
        console.log('Email sent: ' + info.response);
        resolve()
      }
    });
  })
}

const verifyToken=(token)=>{
  return new Promise((resolve,reject)=>{
   jwt.verify(token,process.env.Secret_Key,async(error,decoded)=>{
    error?reject(error):resolve(decoded);
   })  
})}

module.exports = {
  validateUser,
  hashedPassword,
  loginValidation,
  matchPassword,
  todoValidation,
  updateTodoValidation,
  emailAuthintication,
  jwtToken,
  emailVerification,
  verifyToken
};
