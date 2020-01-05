module.exports = (upload)=>{

    const express    = require('express');
    const passport   = require('passport');
    
    const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

    const router=express.Router();

    router.get('/login', ensureLoggedOut(), (req, res) => {
        res.render('authentication/login', { message: req.flash('error')});
    });
    
    router.post('/login', ensureLoggedOut(), passport.authenticate('local-login', {
      successRedirect : '/',
      failureRedirect : '/login',
      failureFlash : true
    }));
    
    router.get('/signup', ensureLoggedOut(), (req, res) => {
        res.render('authentication/signup', { message: req.flash('error')});
    });
    
    router.post('/signup', ensureLoggedOut(), upload.single('profile_img'), passport.authenticate('local-signup', {
      successRedirect : '/',
      failureRedirect : '/signup',
      failureFlash : true
    }));
    
    router.get('/profile', ensureLoggedIn('/login'), (req, res) => {
        // MDH@05JAN2020: you can see how req.user is being passed in to the profile (sub)page (which isn't there yet!!)
        res.render('authentication/profile', {user : req.user});
    });
    
    router.get('/logout', ensureLoggedIn('/login'), (req, res) => {
        req.logout();
        res.redirect('/');
    });

    return router;
}
