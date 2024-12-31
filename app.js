const express = require("express");
var expressLayouts = require("express-ejs-layouts");
var methodOverride = require("method-override");
const { title } = require("process");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();

// setup ejs
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/layout");

// penting banget
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup override
app.use(methodOverride("_method"));

// setup session
app.use(
  session({
    secret: "wepe ganteng",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const port = 3000;

// db connection
require("./utils/db");
const User = require("./model/user");
const Blog = require("./model/blog");

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login Page",
    layout: "layouts/reg",
    err: null,
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.render("login", {
      title: "Home Page",
      err: "email tidak ada",
      layout: "layouts/reg",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.render("login", {
      title: "Home Page",
      err: "password salah",
      layout: "layouts/reg",
    });
  }

  req.session.user = { email: user.email };

  res.redirect("/");
});

// menangani register
app.get("/register", (req, res) => {
  res.render("register", {
    title: "register page",
    layout: "layouts/reg",
    err: null,
  });
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const duplikat = await User.findOne({ email });
  if (duplikat) {
    return res.render("register", {
      title: "Register Page",
      layout: "layouts/reg",
      err: "Email sudah digunakan",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: hashedPassword,
  });

  newUser.save();
  res.redirect("login");
});

app.get("/blog", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const Blogs = await Blog.find();
  console.log(Blogs);
  res.render("blog", {
    title: "blog",
    email: req.session.user.email,
    Blogs,
  });
  // res.render("blog", { title: "blog", Blogs: blog });
});

app.post("/blog", async (req, res) => {
  const { title, detail, author } = req.body;
  console.log(req.body);
  const newBlog = new Blog({
    title,
    detail,
    author,
  });

  try {
    await newBlog.save();
    res.redirect("/blog");
  } catch (error) {
    res.send(error);
  }
});

app.delete("/blog", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const id = req.body.id;
  console.log(id);
  Blog.deleteOne({ _id: id }).then((result) => {
    res.redirect("/");
  });
});

app.get("/blog/add", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("add-blog", { title: "add blog", email: req.session.user.email });
});

app.get("/blog/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const id = req.params.id;
  const blog = await Blog.findOne({ _id: id });
  console.log(blog);
  console.log("ini" + blog.detail);
  res.render("detail-blog", {
    title: "detail blog",
    blog: blog,
    email: req.session.user.email,
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Tidak bisa logout");
    }
    res.redirect("/login");
  });
});

app.get("/profile/:email", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const email = req.params.email;
  const user = await User.findOne({ email: email });

  res.render("profile", {
    title: "detail profile",
    user,
    email: req.session.user.email,
  });
});

app.get("/about", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("about", { title: "about", email: req.session.user.email });
});

app.get("/", async (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  }

  const email = req.session.user.email;

  const Blogs = await Blog.find({ author: email });
  console.log(Blogs);

  res.render("index", {
    title: "Home Page",
    email: req.session.user.email,
    Blogs,
  });
});
