import { initializeApp } from 'firebase';

export const firebase = initializeApp({
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_DOMAIN,
  databaseURL: process.env.FB_URL,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
});
