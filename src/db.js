const mongoose = require('mongoose');
//const URLSlugs = require('mongoose-url-slugs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const FavoriteSchema = new mongoose.Schema({
    favorites: {
        type: [String]
    },
    author: {
        type: String,
        ref: 'User'
    }
});

mongoose.model('User', UserSchema);
mongoose.model('Favorite', FavoriteSchema);

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/cc5638';
}

mongoose.connect(dbconf);