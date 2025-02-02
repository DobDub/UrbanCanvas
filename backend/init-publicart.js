const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://hassanmoharram:prodDBPass@cluster0.4oc5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "Sites";
const COLLECTION_NAME = "Sites";

async function importData() {
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    try {
        const rawData = fs.readFileSync('./data/publicart.json');
        const artworks = JSON.parse(rawData);

        const transformed = artworks.map(artwork => {
            try {
                return {
                    id: artwork.NoInterne,
                    name: artwork.Titre,
                    area: artwork.Arrondissement,
                    address: artwork.AdresseCivique,
                    type: `${artwork.CategorieObjet} - ${artwork.SousCategorieObjet}`,
                    artist: artwork.Artistes?.map(a => `${a.Prenom} ${a.Nom}`).join(', ') || null,
                    organization: artwork.NomCollection,
                    year: convertDate(artwork.DateFinProduction),
                    program: artwork.ModeAcquisition,
                    latitude: artwork.CoordonneeLatitude,
                    longitude: artwork.CoordonneeLongitude,
                    material: artwork.Materiaux,
                    technique: artwork.Technique,
                    image: null,
                    type: "public-art"
                };
            } catch (err) {
                console.error(`Error processing artwork ${artwork.NoInterne}:`, err);
                return null;
            }
        }).filter(Boolean); // Remove failed entries

        await client.connect();
        const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

        // Batch insert in chunks of 100
        const batchSize = 100;
        for (let i = 0; i < transformed.length; i += batchSize) {
            const batch = transformed.slice(i, i + batchSize);
            const result = await collection.insertMany(batch);
            console.log(`Inserted ${result.insertedCount} documents (batch ${i / batchSize + 1})`);
        }

    } catch (err) {
        console.error("Import failed:", err);
    } finally {
        await client.close();
    }
}

function convertDate(dateStr) {
    try {
        if (!dateStr) return null;
        const match = dateStr.match(/\/Date\((-?\d+)/);
        if (!match) return null;

        const timestamp = parseInt(match[1]);
        if (isNaN(timestamp)) return null;

        return new Date(timestamp).getFullYear().toString();
    } catch (err) {
        console.warn(`Date conversion error for ${dateStr}:`, err);
        return null;
    }
}

importData();