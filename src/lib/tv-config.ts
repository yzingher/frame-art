import type { TV } from '@/types';

export const TVS: TV[] = [
  { id: 'tl', name: 'Top Left', ip: '10.0.0.160', size: '32"', position: 'top-left', rotate90: false },
  { id: 'centre', name: 'Centre', ip: '10.0.0.41', size: '43"', position: 'top-center', rotate90: false },
  { id: 'tr', name: 'Top Right', ip: '10.0.0.138', size: '32"', position: 'top-right', rotate90: false },
  { id: 'bl', name: 'Bottom Left', ip: '10.0.0.198', size: '32"', position: 'bottom-left', rotate90: false },
  { id: 'mega', name: 'Mega Frame', ip: '10.0.0.111', size: 'XL', position: 'bottom-center', rotate90: false },
  { id: 'br', name: 'Bottom Right', ip: '10.0.0.82', size: '32"', position: 'bottom-right', rotate90: false },
];

export const getTVById = (id: string): TV | undefined => TVS.find(tv => tv.id === id);
export const getTVsByIds = (ids: string[]): TV[] => TVS.filter(tv => ids.includes(tv.id));
