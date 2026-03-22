export interface TV {
  id: string;
  name: string;
  ip: string;
  size: string;
  position: string;
  rotate90: boolean;
}

export interface ArtHistoryItem {
  id: string;
  imageUrl: string;
  localPath?: string;
  prompt?: string;
  style?: string;
  source: 'generated' | 'uploaded' | 'styled' | 'occasion';
  occasion?: string;
  tvIds: string[];
  createdAt: string;
}

export interface PushResult {
  tvId: string;
  status: 'success' | 'error' | 'pending' | 'pushing';
  error?: string;
}

export interface GenerateRequest {
  prompt: string;
  enhance: boolean;
  size: 'square' | 'landscape';
}

export interface PushRequest {
  imageUrl: string;
  tvIds: string[];
}
