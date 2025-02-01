const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
const csv = require('csv-parser');

const uri = "mongodb+srv://hassanmoharram:prodDBPass@cluster0.4oc5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function importCSV() {
    try {
        await client.connect(); // Connect first
        console.log("Connected to MongoDB!");

        const database = client.db("Sites"); // Replace with your DB name
        const collection = database.collection("Sites");

        // Wrap CSV parsing in a promise
        const results = await new Promise((resolve, reject) => {
            const data = [];
            fs.createReadStream('./data/murales.csv')
                .pipe(csv())
                .on('data', (row) => {
                    const transformed = {
                        id: parseInt(row.id),
                        name: row.name || null,
                        area: row.arrondissement,
                        address: row.adresse,
                        type: row.type || "mural",
                        artist: row.artiste,
                        organization: row.organisme,
                        year: row.annee,
                        program: row.programme_entente,
                        latitude: row.latitude,
                        longitude: row.longitude,
                        material: null,
                        technique: null,
                        image: row.image || null
                    };
                    data.push(transformed);
                })
                .on('end', () => resolve(data))
                .on('error', (err) => reject(err));
        });

        // Insert data
        if (results.length > 0) {
            const insertResult = await collection.insertMany(results);
            console.log(`${insertResult.insertedCount} documents inserted`);
        } else {
            console.log("No data to insert");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close(); // Close connection after all operations
        console.log("Disconnected from MongoDB");
    }
}

importCSV();