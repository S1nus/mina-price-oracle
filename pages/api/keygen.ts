import type { NextApiRequest, NextApiResponse } from "next";
import { isReady, PrivateKey } from "snarkyjs";

// Define the type that our function (and API) will return
type Data = {
  privateKeyBase58: string;
  publicKeyBase58: string;
};

// This is the serverless function that Vercel will run when this endpoint is
// queried
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // We need to wait for SnarkyJS to finish loading before we can do anything
  await isReady;

  // The private key of our account. When running locally the hardcoded key will
  // be used. In production the key will be loaded from a Vercel environment
  // variable.
  const privateKey = PrivateKey.random();
  const publicKey = privateKey.toPublicKey();

  const privateKeyBase58 = privateKey.toBase58();
  const publicKeyBase58 = publicKey.toBase58();

  // Return the Data type that we created earlier
  res.status(200).json({ privateKeyBase58, publicKeyBase58 });
}
