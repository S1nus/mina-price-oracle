import { isReady, PublicKey, PrivateKey, Field, Signature } from "snarkyjs";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  publicKey: PublicKey;
  creditScore: Field;
  signature: Signature;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await isReady;

  const privateKey = PrivateKey.fromBase58(
    process.env.PRIVATE_KEY ??
      "EKF65JKw9Q1XWLDZyZNGysBbYG21QbJf3a4xnEoZPZ28LKYGMw53"
  );
  const publicKey = privateKey.toPublicKey();

  const randomCreditScore = () => Math.floor(Math.random() * 551 + 300);
  const creditScore = Field(randomCreditScore());

  const signature = Signature.create(privateKey, [creditScore]);

  res.status(200).json({ publicKey, creditScore, signature });
}
