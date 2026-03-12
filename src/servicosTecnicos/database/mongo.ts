import mongoose from 'mongoose';

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('❌ MONGODB_URI não definida');
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar no MongoDB:', error);
    process.exit(1);
  }
}