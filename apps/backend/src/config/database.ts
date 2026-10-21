import mongoose from 'mongoose';

export async function connectDB() {
    try {
        // Leemos la variable de entorno de Render
        const mongoURI = process.env.MONGO_URI;

        console.log('--- DIAGNÓSTICO DE VARIABLE ---');
        console.log('Valor de MONGO_URI:', mongoURI ? 'ENCONTRADA Y CARGADA' : 'INEXISTENTE / UNDEFINED');

        if (!mongoURI) {
            throw new Error('La variable process.env.MONGO_URI no está definida en el entorno de Render.');
        }

        console.log('Intentando conectar a MongoDB Atlas...');

        await mongoose.connect(mongoURI, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ Conectado a MongoDB con éxito');
    } catch (err) {
        console.error('❌ Error crítico al conectar a MongoDB:', err.message || err);
        process.exit(1);
    }
}