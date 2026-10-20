import mongoose from 'mongoose';

export async function connectDB() {
    try {
        const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL;

        // Imprimimos en los logs qué está leyendo Node
        if (!mongoURI) {
            console.error('CRÍTICO: No se encontró la variable MONGO_URI en el entorno de Render.');
            process.exit(1);
        }

        console.log('Intentando conectar a MongoDB Atlas...');

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