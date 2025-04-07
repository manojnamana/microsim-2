import memoryCache from '../components/lib/memoryCache';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req, res) {
  const keys = Array.from(memoryCache.keys());
  res.status(200).json({ keys });
}
