require('dotenv').config();
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.DISCORD_TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const app = express();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
},
(token, tokenSecret, profile, done) => {
    // Check profile to verify if the user belongs to the correct organization
    if (profile._json.hd === 'your_school_domain.com') {
        return done(null, profile);
    }
    return done(null, false);
}));

app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication
        const discordID = req.query.state; 
        const guild = client.guilds.cache.get(process.env.DISCORD_SERVER_ID);
        const member = guild.members.cache.get(discordID);
        if (member) {
            member.roles.add(process.env.DISCORD_ROLE_ID);
        }
        res.send('Successfully verified! You can close this window.');
    }
);

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
