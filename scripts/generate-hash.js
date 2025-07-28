const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'password123';
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Generated hash for "password123":', hash);
  
  // Verify the hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification result:', isValid);
}

generateHash().catch(console.error);
