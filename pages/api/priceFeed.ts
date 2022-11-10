import type { NextApiRequest, NextApiResponse } from "next";
import { isReady, PublicKey, PrivateKey, Field, Signature } from "snarkyjs";
const axios = require('axios');

type Data = {
  data: {
    price: Field,
    timestamp: Field,
  };
  signature: Signature;
};

async function getPrice() {
  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?slug=mina', {
      headers: {
        'X-CMC_PRO_API_KEY': 'XXXXXXXXX',
      },
    });
    const data = await response.data;
    let responseKeys = Object.keys(data.data);
    if (responseKeys.length != 1) {
      throw "Invalid price data";
    }
    else {
      return data.data[responseKeys[0]].quote.USD.price;
    }
  }
  catch (ex) {
    console.log(ex);
    throw "Error making price request";
  }

}

async function getHeight() {
    const response = await axios.get('https://api.minaexplorer.com/blocks?limit=1');
    return response.data.blocks[0].blockHeight;
}

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
  /*const callerUserId = Array.isArray(req.query.id)
    ? req.query.id[0]
    : req.query.id ?? "1";

  // We get the users credit score. In this case it's 787 for user 1, and 536
  // for anybody else :)
  const knownCreditScore = (id: string) => (id === "1" ? 787 : 536);*/

  // denominate the price in units of 0.0001, for easy conversion to and from Fields
  let price = await getPrice();
  price = Math.floor(parseFloat(price).toFixed(4) * 10000);
  const height = await getHeight();
  const priceField = Field(price);
  const heightField = Field(height);


  // We compute the public key associated with our private key
  const publicKey = privateKey.toPublicKey();

  // Define a Field with the value of the users id
  //const id = Field(callerUserId);

  // Define a Field with the users credit score
  //const creditScore = Field(knownCreditScore(callerUserId));

  // Use our private key to sign an array of Fields containing the users id and
  // credit score
  const signature = Signature.create(privateKey, [priceField, heightField]);

  // Return the Data type that we created earlier
  res.status(200).json({
    data: { price: priceField, height: heightField },
    signature: signature,
    publicKey: publicKey,
  });
}
