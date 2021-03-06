const express            = require('express');
const path               = require('path');
const favicon            = require('serve-favicon');
const logger             = require('morgan');
const cookieParser       = require('cookie-parser');
const bodyParser         = require('body-parser');
const passport           = require('passport');
const LocalStrategy      = require('passport-local').Strategy;
const User               = require('./models/user');
const bcrypt             = require('bcryptjs');
const session            = require('express-session');
const MongoStore         = require('connect-mongo')(session);
const mongoose           = require('mongoose');
const flash              = require('connect-flash');
const hbs                = require('hbs');

// MDH@05JAN2019: who forgot this one???
hbs.registerPartials(__dirname + '/views/partials');

// for uploading files
const multer             = require('multer'); 
const upload             = multer({dest:'uploads/'});

mongoose.connect('mongodb://localhost:27017/tumblr-lab-development');

const app = express();

app.use('/uploads',express.static('uploads'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(cookieParser()); // MDH: cookieParser before session

app.use(session({
  secret: 'tumblrlabdev',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore( { mongooseConnection: mongoose.connection })
}));

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

passport.use('local-login', new LocalStrategy((username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (!user) {
      console.log("Incorrect username");
      return next(null, false, { message: "Incorrect username" });
    }
    console.log("Comparing password!");
    if (!bcrypt.compareSync(password, user.password)) {
      console.log("Incorrect password");
      return next(null, false, { message: "Incorrect password" });
    }
    console.log("Login accepted!");
    return next(null, user);
  });
}));

passport.use('local-signup',
  new LocalStrategy({ passReqToCallback: true },
  (req, username, password, next) => {
    // console.log("file: ",req.file);
    // NOTE the name of the file (inside uploads) will be in req.file.filename
    // To avoid race conditions
    process.nextTick(() => {
        User.findOne({
            'username': username
        }, (err, user) => {
            if (err){ return next(err); }

            if (user) {
                return next(null, false);
            } else {
                // Destructure the body
                const {
                  username,
                  email,
                  password
                } = req.body;
                const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
                const newUser = new User({
                  username:username,
                  email:email,
                  password: hashPass,
                  profile_img:(req.file&&req.file.filename?req.file.filename:null)
                });

                newUser.save((err) => {
                    if (err){ next(null, false, { message: newUser.errors }) }
                    return next(null, newUser);
                });
            }
        });
    });
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// MDH@05JAN2020: why do I need a / behind public to make CSS work!
app.use(express.static(path.join(__dirname, 'public/')));

const index = require('./routes/index');
const authRoutes = require('./routes/authentication')(upload);

app.use('/', index);
app.use('/', authRoutes);

// MDH@05JAN2020: viewing a list of posts, a single post (contents), creating and saving posts
const postRoutes=require('./routes/posts.js')(upload);
app.use('/posts',postRoutes);

const commentRoutes=require('./routes/comments.js')(upload);
app.use('/comments',commentRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.path);
  }
});

app.listen(3000,()=>{
  console.log("Listening on port 3000.");
});


module.exports = app;
