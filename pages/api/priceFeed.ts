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

  // denominate the price in units of 0.0001, for easy conversion to and from Fields
  let price = await getPrice();
  price = Math.floor(parseFloat(price).toFixed(4) * 10000);
  const height = await getHeight();
  const priceField = Field(price);
  const heightField = Field(height);


  // We compute the public key associated with our private key
  const publicKey = privateKey.toPublicKey();

  const signature = Signature.create(privateKey, [priceField, heightField]);

  // Return the Data type that we created earlier
  res.status(200).json({
    data: { price: priceField, height: heightField },
    signature: signature,
    publicKey: publicKey,
  });
}
