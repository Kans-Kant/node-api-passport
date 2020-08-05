var mongoose = require('mongoose');
var passport = require('passport');

var config = require('../config/database');
require('../config/passport')(passport);

var express = require('express');
var jwt = require('jsonwebtoken');

var router = express.Router();
var User = require("../models/user");
var Produit = require("../models/produit");

var multer  = require('multer');
const path = require('path');

var fs = require('fs');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../assets/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    }
});
var upload = multer({storage: storage});


router.post('/register', function(req, res) {
  if (!req.body.email || !req.body.password) {
    res.json({success: false, msg: 'Please Enter email and password !'});
  } else {
    var newUser = new User({
      email:    req.body.email,
      password: req.body.password,
      nickname: req.body.nickname,
      image:    req.body.image,
      sexe:     req.body.sexe,

    });
    console.log(newUser);
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: err});
      }
      res.json({success: true, msg: 'Register Successful !'});
    });
  }
});

router.post('/login', function(req, res) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found!'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user.toJSON(), config.secret, {
            expiresIn: 604800 // 1 week
          });
          // return the information including token as JSON
          res.json({success: true, token: token});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password!'});
        }
      });
    }
  });
});

router.get('/logout', passport.authenticate('jwt', { session: false}), function(req, res) {
  req.logout();
  console.log("true");
  return res.json({success: true, msg: 'Sign out successfully!'});
});


router.get('/profile', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log( req.user._id);
    User.findById(req.user._id,function (err, user) {
      if (err) return next(err);
      return res.status(200).send({success: true, user: user});
      console.log(user);
    });
  } else {

    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.post('/produit', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {

    var newProduit = new Produit({
      name:         req.body.name,
      category:     req.body.category,
      description:  req.body.description,
      lieu:         req.body.lieu,
      price:        req.body.price,
      devise:       req.body.devise,
      status:       req.body.score,
      imageurl:     req.body.upload,
      userid:       req.user._id,
    });

    console.log(newProduit);

   newProduit.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Erreur Ajout Produit!'});
      }
      res.json({success: true, msg: 'Nouveau Produit Ajouter!'});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/produit', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
 /* var image ={
    data : fs.readFileSync(imgPath),
    contentType : 'image/jpeg',
  }*/
  if (token) {
    Produit.find({userid: req.user._id},function (err, produits) {
      if (err) return next(err);
      res.status(200).send({success: true, produits: produits/*, image: image*/});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});


router.post('/deletep', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  const id = req.body.id // on récupère la valeure dans l'url
  const {ObjectId} = require('mongodb'); // or ObjectID
  console.log(ObjectId(id));
  if (token) {
    Produit.findOneAndRemove({ _id: ObjectId(id) }) 
    .exec(function(err, item) {
        if (err) {
            return res.json({success: false, msg: 'Cannot remove item'});
        }       
        if (!item) {
            return res.status(404).json({success: false, msg: 'Item not found'});
        }  
        res.json({success: true, msg: 'Item deleted !'});
    });

  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});


router.post('/updatep', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  const id = req.body.id;
  const {ObjectId} = require('mongodb'); // or ObjectID

  console.log(ObjectId(id));
  if (token) {
    Produit.findByIdAndUpdate(ObjectId(id),
      {$set:
      {name:req.body.name,
      lieu:req.body.lieu,
      price:req.body.price,
      status:req.body.status,
      image : req.body.upload,
       //image.contentType : 'image/png';
      devise:req.body.devise}},
      {new:true})
    .exec(function(err, item) {
        if (err) {
            return res.json({success: false, msg: 'Cannot updated item !'});
        }       
        if (!item) {
            return res.status(404).json({success: false, msg: 'Item not found !'});
        }  
        res.json({success: true, msg: 'Item updated Successful!'});
    });

  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/countp', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    Produit.count({userid: req.user._id}, function( err, count){ 
      if (err) return next(err);
      res.status(200).send({success: true, total: count});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.post('/photo', upload.single('image'), (req, res, next) => {
  console.log(req.file.path);
    return res.json({
        image: req.file.path
    });
});

router.post('/display', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
   const id = req.body.idp;

  if (token) {
   Produit.find({_id: id},function (err, produit) {
      if (err) return next(err);

      //console.log(produit[0].imageurl);
       data = fs.readFileSync(produit[0].imageurl);
       var base64data = new Buffer(data).toString('base64');
      var image ={
          data : base64data,
          contentType : 'image/jpeg',
      }

      res.status(200).send({success: true, image: image});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;
