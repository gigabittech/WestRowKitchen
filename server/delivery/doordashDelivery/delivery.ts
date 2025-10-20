import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';

dotenv.config();

const accessKey = {
  developer_id: "a91ac3f8-9fcb-423d-a185-b6d475b5d061",
  key_id: "119a2890-6226-469f-94e4-164e4a0509d3",
  signing_secret: "mUJE007e0yW-5vUku0yX5TaVV6jKhN7bNYcDlcmzNAo",
};

const data = {
  aud: 'doordash',
  iss: accessKey.developer_id,
  kid: accessKey.key_id,
  exp: Math.floor(Date.now() / 1000 + 300),
  iat: Math.floor(Date.now() / 1000),
}


const payload = {
  aud: "doordash",
  iss: accessKey.developer_id,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 300,
};

const headers = { algorithm: 'HS256', header: { 'dd-ver': 'DD-JWT-V1' } }

const token = jwt.sign(
  data,
  Buffer.from(accessKey.signing_secret, 'base64'),
  headers
)

console.log("✅ DoorDash JWT:", token);

const Delivery = async (req: Request, res: Response) => {
  const body = {
    external_delivery_id: "D-12347",
    pickup_address: "901 Market Street 6th Floor San Francisco, CA 94103",
    pickup_business_name: "Wells Fargo SF Downtown",
    pickup_phone_number: "+16505555555",
    pickup_instructions: "Enter gate code 1234 on the callbox.",
    dropoff_address: "901 Market Street 6th Floor San Francisco, CA 94103",
    dropoff_business_name: "Wells Fargo SF Downtown",
    dropoff_phone_number: "+16505555555",
    dropoff_instructions: "Enter gate code 1234 on the callbox.",
    order_value: 1999,
  };

  try {
    const response = await axios
      .post('https://openapi.doordash.com/drive/v2/deliveries', body, {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      })
     

    console.log("🚀 Success:", response.data);
    res.json(response.data);
  } catch (err: any) {
    console.log("❌ Error:", err.response?.status, err.response?.data);
    res.status(err.response?.status || 500).json(err.response?.data);
  }


  //   try {
  //   const response = await axios
  //     .get('https://openapi.doordash.com/drive/v2/deliveries/D-12345', {
  //   headers: {
  //     Authorization: 'Bearer ' + token,
  //     'Content-Type': 'application/json',
  //   },
  //     })
     

  //   console.log("🚀 Success:", response.data);
  //   res.json(response.data);
  // } catch (err: any) {
  //   console.log("❌ Error:", err.response?.status, err.response?.data);
  //   res.status(err.response?.status || 500).json(err.response?.data);
  // }
 


};

export default Delivery;










// try {
//   const { orderId, dropoffAddress, dropoffPhone, pickupAddress, pickupPhone, manifest } = req.body;

//   console.log("Data are", { orderId, dropoffAddress, dropoffPhone, pickupAddress, pickupPhone, manifest })

//   if (!orderId || !dropoffAddress || !dropoffPhone) {
//     return res.status(400).json({ success: false, error: 'Missing required fields' });
//   }

//   const accessKey = {
//     developer_id: "a91ac3f8-9fcb-423d-a185-b6d475b5d061",
//     key_id: "3e75c0e5-29ca-4ed8-b0ee-339e8ea16453",
//     signing_secret: "AtAjw9-Z55MuiKVbm6_uu9NrMaXuI-W_QH6QawDEGcA",
//   };

//   // const token = jwt.sign(
//   //   {
//   //     aud: 'doordash',
//   //     iss: accessKey.developer_id,
//   //     kid: accessKey.key_id,
//   //     exp: Math.floor(Date.now() / 1000 + 300),
//   //     iat: Math.floor(Date.now() / 1000),
//   //   },
//   //   accessKey.signing_secret, // <-- use plain string
//   //   { algorithm: 'HS256', header: { 'dd-ver': 'DD-JWT-V1' } }
//   // );




//   const deliveryPayload = {
//     pickup_address: pickupAddress || '123 Main St, SF',
//     dropoff_address: dropoffAddress,
//     pickup_phone_number: pickupPhone || '+14155551234',
//     dropoff_phone_number: dropoffPhone,
//     external_delivery_id: `order-${orderId}`,
//     manifest: manifest || 'Package description',
//   };

//   console.log('DoorDash delivery payload:', deliveryPayload);

//   const response = await axios.post(
//     'https://api.doordash.com/drive/v2/deliveries',
//     deliveryPayload,
//     { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
//   );

//   console.log('DoorDash response:', response.data);

//   res.json({ success: true, data: response.data });
// } catch (err: any) {
//   console.error('DoorDash error:', err.response?.data || err.message);
//   res.status(500).json({ success: false, error: err.response?.data?.message || err.message });
// }
