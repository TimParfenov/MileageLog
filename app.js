const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const ejsMate = require('ejs-mate');
const Timesheet = require('./models/timesheet');
const Location = require('./models/location');
const Project = require('./models/project');
const { Timestamp } = require('bson');
const methodOverride = require('method-override');
const { config } = require('dotenv').config();

const session = require('express-session');
const MongoStore = require('connect-mongo');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));



const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/timesheet'

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true, 
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoStore({
      secret,
      mongoUrl: dbUrl,
      touchAfter: 24 * 3600
    });

store.on('error', function(e) {
    console.log('Session store error', e)
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

function wrapAsync(fn) {
  return function (req, res, next) {
      fn(req, res, next).catch(e => next(e));
  }
}

// view overview
app.get('/overview', wrapAsync(async(req, res) => {
  const timesheets = await Timesheet.find({})
  res.render('overview', {timesheets})
}));

// Add new Location 
app.get('/new', wrapAsync(async (req, res) => {
  res.render('new')
}));

app.post('/new', wrapAsync(async (req, res) => {
  const newLocation = new Location(req.body)
  await newLocation.save();
  res.redirect('/')
}));

// Add new Project 
app.get('/newPr', wrapAsync(async (req, res) => {
  res.render('newPr')
}));

app.post('/newPr', wrapAsync(async (req, res) => {
  const newProject = new Project(req.body)
  await newProject.save();
  res.redirect('/')
}));


// Add start 
app.get('/', wrapAsync(async(req, res) => {
  const locations = await Location.find({})
  res.render('start', {locations})
}));

app.post('/', wrapAsync(async(req, res) => {
  const newTimesheet = new Timesheet(req.body);
  await newTimesheet.save()
  res.redirect(`/finish/${newTimesheet._id}`)
  }));


// Add finish 
app.get('/finish/:id', wrapAsync(async (req, res) => {
  const {id} = req.params;
  const locations = await Location.find({})
  const projects = await Project.find({})
  const timesheets = await Timesheet.findById(id);
  res.render('finish', {locations, projects, timesheets})
}));

app.put('/finish/:id', wrapAsync(async (req, res) => {
  const {id} = req.params;
  const timesheets = await Timesheet.findByIdAndUpdate(id, req.body, {runValidators: true, new: true})
  res.redirect('/overview')
}))



// app.listen(3000, () => {
//   console.log('Connected to 3000')
// });

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Connected to ${port}`)
});
