// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
const app = express();

// Import environment variables in order to connect to database - DO NOT MODIFY
require('dotenv').config();

// Import the models used in these routes - DO NOT MODIFY
const { Band, Musician } = require('./db/models');

// Express using json - DO NOT MODIFY
app.use(express.json());

// STEP 1: Example of lazy loading
app.get('/bands-lazy/:id', async (req, res, next) => {
    const band = await Band.findByPk(req.params.id);
    const bandMembers = await band.getMusicians({ order: [['firstName']] });
    const payload = {
        id: band.id,
        name: band.name,
        createdAt: band.createdAt,
        updatedAt: band.updatedAt,
        Musicians: bandMembers
    }
    res.json(payload);
});

// STEP 1: Example of eager loading
app.get('/bands-eager/:id', async (req, res, next) => {
    const payload = await Band.findByPk(req.params.id, {
        include: { model: Musician },
        order: [[Musician, 'firstName']]
    });
    res.json(payload);
});

// STEP 2: Lazy loading all bands
app.get('/bands-lazy', async (req, res, next) => {
    const allBands = await Band.findAll({ order: [['name']] })
    const payload = [];
    for (let i = 0; i < allBands.length; i++) {
        const band = allBands[i];
        // Your code here
        const bandMembers = await band.getMusicians({ order: [['firstName']] });
        const bandData = {
            id: band.id,
            name: band.name,
            createdAt: band.createdAt,
            updatedAt: band.updatedAt,
            // Your code here
            Musicians: bandMembers
        };
        payload.push(bandData);
    }
    res.json(payload)
});

// STEP 3: Eager loading all bands
app.get('/bands-eager', async (req, res, next) => {
    const payload = await Band.findAll({
        // Your code here
        order: [['name']],
        include: { model: Musician }
    });
    res.json(payload);
});

const { Instrument, MusicianInstrument } = require('./db/models/index.js');
// Bonus: More association practice
// Lazy loading
app.get('/get-instruments-lazy', async (req, res, next) => {
    const instruments = await Instrument.findAll({ order: [['id']] });
    const payload = [];
    for (const instrument of instruments) {
        const musicians = await instrument.getMusicians();
        const instrumentData = {
            id: instrument.id,
            type: instrument.type,
            createdAt: instrument.createdAt,
            updatedAt: instrument.updatedAt,
            Musicians: musicians
        }
        payload.push(instrumentData);
    }
    res.json(payload);
})
app.get('/get-instruments-lazy/:id', async (req, res, next) => {
    try {
        const instrument = await Instrument.findByPk(req.params.id);
        if (instrument) {
            const musician = await instrument.getMusicians();
            const payload = {
                id: instrument.id,
                type: instrument.type,
                createdAt: instrument.createdAt,
                updatedAt: instrument.updatedAt,
                Musicians: musician
            };
            res.json(payload);
        } else {
            res.json({ message: 'no such instrument' });
        }
    } catch (err) {
        next(err);
    }
})

// Eager Loading
app.get('/get-instruments-eager', async (req, res, next) => {
    const payload = await Instrument.findAll({
        order: [['id'], [Musician, 'firstName']],
        include: Musician
    });
    res.json(payload)
})

app.get('/get-instruments-eager/:id', async (req, res, next) => {
    try {
        const payload = await Instrument.findOne({
            where: { id: req.params.id },
            include: { model: Musician }
        })
        res.json(payload)
    } catch (err) { next(err); }
})

// Root route - DO NOT MODIFY
app.get('/', (req, res) => {
    res.json({
        message: "API server is running"
    });
});

// Set port and listen for incoming requests - DO NOT MODIFY
const port = 5000;
app.listen(port, () => console.log('Server is listening on port', port));
