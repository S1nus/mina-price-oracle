import { isReady, PublicKey, PrivateKey, Field, Signature } from "snarkyjs";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  publicKey: PublicKey;
  id: Field;
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

  const callerUserId = Array.isArray(req.query.id)
    ? req.query.id[0]
    : req.query.id ?? "1";

  // const randomCreditScore = () => Math.floor(Math.random() * 551 + 300);
  const knownCreditScore = (id: string) => (id === "1" ? 787 : 536);

  const publicKey = privateKey.toPublicKey();
  const id = Field(callerUserId);
  const creditScore = Field(knownCreditScore(callerUserId));
  const signature = Signature.create(privateKey, [id, creditScore]);

  res.status(200).json({ publicKey, id, creditScore, signature });
}
