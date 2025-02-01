const { MongoClient, ServerApiVersion } = require('mongodb');
const axios = require('axios');
require('dotenv').config();

// Add sleep function for rate limiting
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// MongoDB connection URI
const uri = "mongodb+srv://hassanmoharram:prodDBPass@cluster0.4oc5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Google API settings
const API_KEY = process.env.GOOGLE_API_KEY;
const CSE_ID = process.env.GOOGLE_CSE_ID;
const SEARCH_URL = "https://www.googleapis.com/customsearch/v1";

async function searchGoogleImages(query, retries = 3, backoffDelay = 1000) {
    try {
        const response = await axios.get(SEARCH_URL, {
            params: { q: query, cx: CSE_ID, key: API_KEY, searchType: 'image', num: 1 },
        });
        return response.data.items?.[0]?.link || null;
    } catch (error) {
        if (retries > 0 && error.response?.status === 429) {
            console.log(`Retrying (${retries} left) after ${backoffDelay}ms...`);
            await sleep(backoffDelay);
            return searchGoogleImages(query, retries - 1, backoffDelay * 2); // Double the delay each retry
        } else {
            console.error("Google API Error:", error.message);
            return null;
        }
    }
}

async function updateImagesInMongoDB() {
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        const database = client.db("Sites");
        const collection = database.collection("Sites");
        const cursor = collection.find({ image: null }); // Changed to target null values

        let processedCount = 0;

        for await (const doc of cursor) {
            processedCount++;
            const title = doc.name || "";
            const artist = doc.artist || "";
            const query = `${title} ${artist} public art`; // Added "public art" for better results

            console.log(`Processing document ${doc._id} (${processedCount}/${await collection.countDocuments({ image: null })}): ${query}`);

            const imageUrl = await searchGoogleImages(query);

            // Add delay between requests
            await sleep(1500); // 1.5 second delay

            if (imageUrl) {
                await collection.updateOne(
                    { _id: doc._id },
                    { $set: { image: imageUrl } }
                );
                console.log(`✅ Updated ${doc._id}`);
            } else {
                console.log(`❌ No image found for: ${query}`);
            }
        }
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await client.close();
    }
}

updateImagesInMongoDB().catch(console.dir);