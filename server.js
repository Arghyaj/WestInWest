const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const http = require('http');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('flash');
const passport = require('passport');
const socketIO = require('socket.io');
const {Users} = require('./helpers/UsersClass');
const {Global} = require('./helpers/Global');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const NodeGeocoder = require('node-geocoder');
const compression = require('compression');
const helmet = require('helmet');


const container = require('./container');


container.resolve( function( _, users , admin , home, group, results, privatechat, profile, interests, news, article) {
  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://arghyaj:9832481461@ds157089.mlab.com:57089/dinbing', {useMongoClient: true});
  mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
  const app = SetupExpress();

  function SetupExpress() {
    const app = express();
    const server = http.createServer(app);
    const io = socketIO(server);
    server.listen(5000, function() {
      console.log('Listening on port 3000');
    });
    ConfigureExpress(app , io);

    require('./socket/groupchat')(io , Users );
    require('./socket/friends')(io);
    require('./socket/globalroom')(io, Global, _);
    require('./socket/privatemessage')(io);
    // Setup Router
    const router = require('express-promise-router')();
    users.SetRouting(router);
    admin.SetRouting(router);
    home.SetRouting(router);
    group.SetRouting(router);
    results.SetRouting(router);
    privatechat.SetRouting(router);
    profile.SetRouting(router);
    interests.SetRouting(router);
    news.SetRouting(router);
    article.SetRouting(router);

    app.use(router);

    app.use(function(req, res){
      res.render('404');
    });
  }

  function ConfigureExpress(app , io) {

    app.use(compression());
    app.use(helmet());

    require('./passport/passport-local');
    require('./passport/passport-facebook');
    require('./passport/passport-google');



    app.use(express.static('public'));
    app.use(cookieParser());
    app.set('view engine', 'ejs');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // app.use(function(req, res, next){
    //   res.locals.login = req.isAuthenticated();
    //   next();
    // })

    app.use(validator());

    app.use(session({
//         secret: process.env.SECRETKEY,
        secret: "IHaveADream",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongooseConnection: mongoose.connection})
    }));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());

    app.locals._ = _ ;

  }

});


// const express = require('express');
// const bodyParser = require('body-parser');
// const ejs = require('ejs');
// const http = require('http');
// const cookieParser = require('cookie-parser');
// const validator = require('express-validator');
// const session = require('express-session');
// const MongoStore = require('connect-mongo')(session);
// const mongoose = require('mongoose');
// const flash = require('flash');
// const passport = require('passport');
// const socketIO = require('socket.io');
// const {Users} = require('./helpers/UsersClass');
// const {Global} = require('./helpers/Global');
//
//
// const container = require('./container');
//
//
// container.resolve( function( _, users , admin , home, group ) {
//   mongoose.Promise = global.Promise;
//   mongoose.connect('mongodb://localhost/dinbing', {useMongoClient: true});
//
//   const app = SetupExpress();
//
//   function SetupExpress() {
//     const app = express();
//     const server = http.createServer(app);
//     const io = socketIO(server);
//     server.listen(3000, function() {
//       console.log('Listening on port 3000');
//     });
//     ConfigureExpress(app , io);
//
//     require('./socket/groupchat')(io , Users );
//     require('./socket/friends')(io);
//     require('./socket/globalroom')(io, Global, _);
//     // Setup Router
//     const router = require('express-promise-router')();
//     users.SetRouting(router);
//     admin.SetRouting(router);
//     home.SetRouting(router);
//     group.SetRouting(router);
//
//     app.use(router);
//   }
//
//   function ConfigureExpress(app , io) {
//     require('./passport/passport-local');
//     require('./passport/passport-facebook');
//     require('./passport/passport-google');
//
//
//
//     app.use(express.static('public'));
//     app.use(cookieParser());
//     app.set('view engine', 'ejs');
//     app.use(bodyParser.json());
//     app.use(bodyParser.urlencoded({ extended: true }));
//
//     app.use(validator());
//
//     app.use(session({
//         secret: 'secretkey',
//         resave: false,
//         saveUninitialized: false,
//         store: new MongoStore({mongooseConnection: mongoose.connection})
//     }));
//     app.use(flash());
//
//     app.use(passport.initialize());
//     app.use(passport.session());
//
//     app.locals._ = _ ;
//
//   }
//
// });
