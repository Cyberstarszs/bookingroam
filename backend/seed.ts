import { db } from './src/db';
import { users } from './src/db/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      name: 'Super Admin',
      email: 'admin@bookingroam.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Seed berhasil: Akun admin telah ditambahkan (admin@bookingroam.com / admin123)');
    process.exit(0);
  } catch (error) {
    console.error('Seed gagal:', error);
    process.exit(1);
  }
}

seed();
