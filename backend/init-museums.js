const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
const csv = require('csv-parser');

const uri = "mongodb+srv://hassanmoharram:prodDBPass@cluster0.4oc5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Function to get a new client instance
function getClient() {
    return new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });
}

// Import CSV data into the "BasicBuildings" collection
async function importBasicBuildings() {
    const client = getClient();
    try {
        await client.connect(); // Connect to MongoDB
        console.log("Connected to MongoDB for import!");

        const database = client.db("Sites"); // Change if your database name is different
        const collection = database.collection("Sites");

        // Wrap CSV parsing in a promise so we can await its completion
        const results = await new Promise((resolve, reject) => {
            const data = [];
            fs.createReadStream('./data/museums.csv')
                .pipe(csv())
                .on('data', (row) => {
                    // Transform the CSV row into the desired document format.
                    // For each field, if data is missing, assign null.
                    const transformed = {
                        arrondissement: row['Arrondissement'] || null,
                        networkName: row['Noms du réseau'] || null,
                        culturalSiteName: row['Nom du lieu culturel municipal'] || null,
                        address: row['Adresse'] || null,
                        postalCode: row['Code postal'] || null,
                        city: row['Ville'] || null,
                        province: row['Province'] || null,
                        phone: row['Téléphone général'] || null,
                        website: row['Site Internet'] || null,
                        // Convert longitude and latitude to numbers if possible; otherwise, assign null.
                        longitude: row['Longitude'] ? parseFloat(row['Longitude']) : null,
                        latitude: row['Latitude'] ? parseFloat(row['Latitude']) : null,
                        type: "museums"
                    };

                    // Log the transformed document for debugging purposes
                    console.log("Transformed document:", transformed);
                    data.push(transformed);
                })
                .on('end', () => resolve(data))
                .on('error', (err) => reject(err));
        });

        // Insert the parsed documents into the collection.
        if (results.length > 0) {
            const insertResult = await collection.insertMany(results);
            console.log(`${insertResult.insertedCount} documents inserted into BasicBuildings`);
        } else {
            console.log("No data to insert.");
        }
    } catch (err) {
        console.error("Error during import:", err);
    } finally {
        await client.close(); // Ensure the connection is closed
        console.log("Disconnected from MongoDB after import.");
    }
}

// Query the "BasicBuildings" collection to verify the inserted documents.
async function checkDocuments() {
    const client = getClient();
    try {
        await client.connect();
        console.log("Connected to MongoDB for checking documents!");

        const database = client.db("Sites");
        const collection = database.collection("Sites");

        const docs = await collection.find({}).toArray();
        console.log("Documents in BasicBuildings:", docs);
    } catch (err) {
        console.error("Error while checking documents:", err);
    } finally {
        await client.close();
        console.log("Disconnected from MongoDB after checking documents.");
    }
}

// Run the import, then check the inserted documents.
async function run() {
    await importBasicBuildings();
    await checkDocuments();
}

run().catch(err => console.error("Error in run():", err));
