const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = 3000;

app.use(cors());
app.set('view engine', 'ejs');

const uri = "mongodb+srv://hassanmoharram:prodDBPass@cluster0.4oc5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Database connection middleware
app.use(async (req, res, next) => {
    try {
        await client.connect();
        req.collection = client.db("Sites").collection("Sites");
        next();
    } catch (err) {
        res.status(500).json({ error: "Database connection failed" });
    }
});

// Search endpoint (must come before other routes)
app.get('/api/murals/artist/:artist', async (req, res) => {
    try {
        const artistName = decodeURIComponent(req.params.artist);
        const query = {
            artist: { $regex: new RegExp(artistName, 'i') }
        };

        const results = await req.collection.find(query).toArray();
        res.json(results.length > 0 ? results : { message: "No murals found for this artist" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Existing endpoints
app.get('/api/murals', async (req, res) => {
    try {
        const murals = await req.collection.find({}).toArray();
        res.json(murals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', async (req, res) => {
    try {
        const murals = await req.collection.find({}).toArray();
        res.render('index', { murals });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Filter by year
app.get('/api/murals/year/:year', async (req, res) => {
    try {
        const year = escapeRegex(req.params.year);
        const query = { year: { $regex: new RegExp(year, 'i') } };
        const results = await req.collection.find(query).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Filter by organization
app.get('/api/murals/organization/:org', async (req, res) => {
    try {
        const org = escapeRegex(req.params.org);
        const query = { organization: { $regex: new RegExp(org, 'i') } };
        const results = await req.collection.find(query).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Filter by area (arrondissement)
app.get('/api/murals/area/:area', async (req, res) => {
    try {
        const area = escapeRegex(req.params.area);
        const query = { area: { $regex: new RegExp(area, 'i') } };
        const results = await req.collection.find(query).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Close connection after each request
app.use((req, res, next) => {
    client.close();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});