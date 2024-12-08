// Spotify authentication & data fetching!

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

let accessToken = '';

// Spotify login endpoint
app.get('/login', (req, res) => {
    const scope = 'user-top-read';
    // More info about this scope here! -> https://developer.spotify.com/documentation/web-api/concepts/scopes#user-top-read:~:text=a%20Show%27s%20Episodes-,user%2Dtop%2Dread,-Description
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    res.redirect(authUrl);
});


// Callback endpoint
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',

            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri,
                client_id,
                client_secret,
            }).toString(),

            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
        );

        accessToken = response.data.accessToken;
        res.redirect('http://localhost:3000');
    } catch(error) {
        res.status(500).send('Error during token exchange for Spotify login')
    }
});

// TMS function #1: Get the top 10 tracks of the year
app.get('/top-tracks', async (req, res) => {
    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10&offset=0', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        res.json(response.data.items);
    } catch (error) {
        res.status(500).send('Error fetching top tracks of the year');
    }
});

// TMS function #2: Get the top 10 artists of the year
app.get('/top-artists', async (req, res) => {
    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10&offset=0', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        res.json(response.data.items);
    } catch (error) {
        res.status(500).send('Error fetching top tracks of the year');
    }
});