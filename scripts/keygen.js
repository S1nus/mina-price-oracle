const { isReady, PrivateKey } = require("snarkyjs");

async function generateKeypair() {
  await isReady;

  const privateKey = PrivateKey.random();
  const publicKey = privateKey.toPublicKey();

  const privateKeyBase58 = privateKey.toBase58();
  const publicKeyBase58 = publicKey.toBase58();

  console.log({ privateKeyBase58, publicKeyBase58 });
}

generateKeypair();

process.exit(); // Fix this