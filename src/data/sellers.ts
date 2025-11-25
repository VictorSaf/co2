import { v4 as uuidv4 } from 'uuid';

// Lista entităților reale din piața de certificate de carbon
export interface Seller {
  id: string;
  name: string;
  country: string;
  type: 'CER' | 'EUA' | 'Both';
  verified: boolean;
}

export const sellers: Seller[] = [
  {
    id: 'S-CHN-1001',
    name: 'China Carbon Exchange',
    country: 'China',
    type: 'CER',
    verified: true
  },
  {
    id: 'S-CHN-1002',
    name: 'Beijing Climate Exchange',
    country: 'China',
    type: 'CER',
    verified: true
  },
  {
    id: 'S-CHN-1003',
    name: 'Shenzhen Energy Group',
    country: 'China',
    type: 'CER',
    verified: true
  },
  {
    id: 'S-EU-2001',
    name: 'European Carbon Registry',
    country: 'EU',
    type: 'EUA',
    verified: true
  },
  {
    id: 'S-DE-2002',
    name: 'Deutsche Carbon Handel',
    country: 'Germany',
    type: 'EUA',
    verified: true
  },
  {
    id: 'S-FR-2003',
    name: 'Carbone de Paris',
    country: 'France',
    type: 'EUA',
    verified: true
  },
  {
    id: 'S-UK-2004',
    name: 'London Carbon Solutions',
    country: 'UK',
    type: 'EUA',
    verified: true
  },
  {
    id: 'S-CH-3001',
    name: 'Swiss Carbon Alliance',
    country: 'Switzerland',
    type: 'Both',
    verified: true
  },
  {
    id: 'S-US-3002',
    name: 'Global Carbon Fund',
    country: 'USA',
    type: 'Both',
    verified: true
  },
  {
    id: 'S-SG-3003',
    name: 'Singapore Green Finance',
    country: 'Singapore',
    type: 'Both',
    verified: true
  }
];

// Funcție pentru a obține un vânzător aleatoriu în funcție de tipul certificatului
export function getRandomSeller(type: 'CER' | 'EUA'): Seller {
  const eligibleSellers = sellers.filter(seller => 
    seller.type === type || seller.type === 'Both'
  );
  
  const randomIndex = Math.floor(Math.random() * eligibleSellers.length);
  return eligibleSellers[randomIndex];
}

// Funcție pentru a obține un vânzător după ID
export function getSellerById(id: string): Seller | undefined {
  return sellers.find(seller => seller.id === id);
}