import type { NextApiRequest, NextApiResponse } from "next";
import { isReady, PublicKey, PrivateKey, Field, Signature } from "snarkyjs";

// Define the type that our function (and API) will return
type Data = {
  data: {
    id: Field;
    creditScore: Field;
  };
  signature: Signature;
  publicKey: PublicKey;
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
  const privateKey = PrivateKey.fromBase58(
    process.env.PRIVATE_KEY ??
      "EKF65JKw9Q1XWLDZyZNGysBbYG21QbJf3a4xnEoZPZ28LKYGMw53"
  );

  // `res.query.id` can be a string or an array of strings. We need to check
  // which it is, and convert it to a single string (by grabbing the first
  // element) if it is an array. If the request is undefined then we will assign
  // `callerUserId` to the string "1".
  const callerUserId = Array.isArray(req.query.id)
    ? req.query.id[0]
    : req.query.id ?? "1";

  // We get the users credit score. In this case it's 787 for user 1, and 536
  // for anybody else :)
  const knownCreditScore = (id: string) => (id === "1" ? 787 : 536);

  // We compute the public key associated with our private key
  const publicKey = privateKey.toPublicKey();

  // Define a Field with the value of the users id
  const id = Field(callerUserId);

  // Define a Field with the users credit score
  const creditScore = Field(knownCreditScore(callerUserId));

  // Use our private key to sign an array of Fields containing the users id and
  // credit score
  const signature = Signature.create(privateKey, [id, creditScore]);

  // Return the Data type that we created earlier
  res.status(200).json({
    data: { id, creditScore },
    signature: signature,
    publicKey: publicKey,
  });
}
