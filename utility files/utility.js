const validator = require("validator");
const bcrypt = require("bcrypt");
const env = require("dotenv");
const userModel = require("../Models/userSchema");
const { response } = require("express");
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
      console.log(user);
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

function todoValidation(todo){
 return new Promise((resolve,reject)=>{ 
    if(todo)
    {
      resolve()
    }
    else{
     return reject("Please enter a todo")
    }
  })
}

function updateTodoValidation(id,updateTodo){
  return new Promise((resolve,reject)=>{
    console.log(id,updateTodo,"testtttts")
      if(!id)
      {
        reject("Please provide valid Id")
      }
      else if(!updateTodo){
        reject("No changes to be made")
      }
      else{
        resolve()
      }
  })
}
module.exports = {
  validateUser,
  hashedPassword,
  loginValidation,
  matchPassword,
  todoValidation,
  updateTodoValidation
};
