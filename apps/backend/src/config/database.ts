import mongoose from 'mongoose';

export async function connectDB() {
    try {
        // Prioriza MONGO_URI (que es la que está cargada en Render)
        const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/comercial';

        console.log('Intentando conectar a:', mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas (Nube)' : 'Localhost');

        await mongoose.connect(mongoURI, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ Conectado a MongoDB con éxito');
    } catch (err) {
        console.error('❌ Error al conectar a MongoDB:', err);
        process.exit(1);
    }
}