const express = require("express");
const env = require("dotenv");
env.config();
const app = express();
const port = parseInt(process.env.PORT);
app.use(express.json());
const DbConnect = require("./db");
const userModel = require("./Models/userSchema");
const sessionModel = require("./Models/sessionAusthSchema");
const session = require("express-session");
const MongoDbSession = require("connect-mongodb-session")(session);
const isAuth = require("./MiddelWare/isAuth");

var store = new MongoDbSession({
  uri: process.env.db,
  collection: "sessions",
});
app.use(
  session({
    secret: process.env.Secret_Key,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
const {
  validateUser,
  hashedPassword,
  loginValidation,
  matchPassword,
  todoValidation,
  updateTodoValidation,
  emailAuthintication,
  jwtToken,
  emailVerification,
  verifyToken,
} = require("./utility files/utility");
const { default: mongoose } = require("mongoose");
const todoSchema = require("./Models/todoSchema");
const rateLimiting = require("./MiddelWare/rateLimiting");

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/signUp", rateLimiting, async (req, res) => {
  const { name, email, password, age } = req.body;
  try {
    await validateUser({ name, email, password, age });
    let user = await userModel.findOne({ email: email });
    if (user) {
      return res.send({
        status: 400,
        message: "email already exist",
      });
    }
    let userName = await userModel.findOne({ name });
    if (userName) {
      return res.send({
        status: 400,
        message: "User name already exist",
      });
    }
    let hashedpass = await hashedPassword({ password });
    let newUser = new userModel({ name, email, password: hashedpass, age });
    await newUser.save();
    const verifiedToken = jwtToken(email);
    await emailVerification(email, verifiedToken);
    res.send({
      status: 201,
      message: "SignUp successfully",
    });
  } catch (error) {
    return res.send({
      status: 400,
      message: error,
    });
  }
});

app.get("/verifyEmail/:token", async (req, res) => {
  const token = req.params.token;
  try {
    let verifiedToken = await verifyToken(token);
    if (verifiedToken) {
      let updateData = await userModel.findOneAndUpdate(
        { email: verifiedToken },
        { isEmailAuth: true }
      );
      res.send({
        status: 200,
        message: "Verification successful",
      });
    }
  } catch (error) {
    res.status(403).json({ message: error });
  }
});

app.post("/login", rateLimiting, async (req, res) => {
  const { userId, password } = req.body;
  try {
    let data = await loginValidation(userId);

    await emailAuthintication(data);
    await matchPassword(password, data.password);

    req.session.isAuth = true;
    req.session.user = {
      email: data.email,
      id: data._id,
      name: data.name,
    };

    res.send({
      status: 200,
      message: "Login Successful",
    });
  } catch (error) {
    res.send({
      status: 400,
      message: error.message,
    });
  }
});

app.get("/dashnord", isAuth, (req, res) => {
  res.send({
    status: 200,
    authintic: true,
    message: "Welcome to Dashbord",
  });
});

app.post("/logout", isAuth, rateLimiting, (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.send({
        status: 500,
        message: error.message,
      });
    } else {
      res.send({
        status: 200,
        message: "Logout successfully",
      });
    }
  });
});

app.post("/logout_from_all_devices", isAuth, rateLimiting, async (req, res) => {
  let email = req.session.user.email;

  // const sessionSchema = new mongoose.Schema({_id:String},{strict:false})
  // const sessionModel = mongoose.model('session',sessionSchema)

  try {
    let deleteSessionFromAll = await sessionModel.deleteMany({
      "session.user.email": email,
    });
    return res.send({
      status: 200,
      message: "Logout successfull from all the devices",
      data: deleteSessionFromAll,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
});

app.post("/todo", isAuth, rateLimiting, async (req, res) => {
  const { todo } = req.body;
  const userName = req.session.user.name;

  try {
    await todoValidation(todo);
    const todoModel = new todoSchema({ todo, userName });
    const savedTodo = await todoModel.save();
    res.send({
      status: 201,
      message: "Todo added Successfully",
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error,
    });
  }
});
app.post("/updateTodo", isAuth, rateLimiting, async (req, res) => {
  const { id, updatedTodo } = req.body;

  try {
    await updateTodoValidation(id, updatedTodo);
    const user = req.session.user.name;
    const findUserByID = await todoSchema.findById(id);
    if (user === findUserByID.userName) {
      const updateData = await todoSchema.findByIdAndUpdate(id, {
        todo: updatedTodo,
      });
      res.send({
        status: 200,
        message: `Your Todo has been Updated Succesfully`,
        data: updateData,
      });
    } else {
      res.send({
        status: 400,
        message: "You are not Authorized to make this update",
      });
    }
  } catch (error) {
    res.send({
      status: 500,
      message: error,
    });
  }
});

app.post("/deleteTodo", isAuth, rateLimiting, async (req, res) => {
  let { id } = req.body;
  const user = req.session.user.name;
  try {
    const findTodo = await todoSchema.findById(id);
    if (user === findTodo.userName) {
      const deleteTodo = await todoSchema.findByIdAndDelete(id);
      res.send({
        status: 200,
        message: "Todo deleted successfully",
      });
    } else {
      res.send({
        status: 400,
        message: "You are not Authorized to delete this",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

app.get("/getTodos", isAuth, async (req, res) => {
  const user = req.session.user.name;

  try {
    const todos = await todoSchema.find({ userName: user });
    res.send({
      status: 200,
      data: todos,
      message: "Successfully fetched",
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
});

app.get("/getTodosPagination", isAuth, async (req, res) => {
  const skip = req.query.skip || 0;
  const limit = req.query.pagination || 5;
  let user = req.session.user.name;
  try {
    const todo = await todoSchema.aggregate([
      {
        $match: { userName: user },
      },
      {
        $facet: {
          data: [{ $skip: parseInt(skip) }, { $limit: parseInt(limit) }],
        },
      },
    ]);
    return res.send({
      status: 200,
      message: "read successful",
      data: todo,
    });
  } catch (error) {
    res.send({
      status: 500,
      message: error.message,
    });
  }
});

DbConnect().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
});
