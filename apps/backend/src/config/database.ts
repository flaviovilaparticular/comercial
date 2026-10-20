import mongoose from 'mongoose';

export async function connectDB() {
    try {
        // Acepta MONGO_URI o MONGO_URL, y si ninguna existe usa la versión local
        const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/comercial';

        await mongoose.connect(mongoURI, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ Conectado a MongoDB');
    } catch (err) {
        console.error(' Error al conectar a MongoDB:', err);
        process.exit(1);
    }
}