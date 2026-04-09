export type View = 'empire' | 'generate' | 'thumbnails' | 'boards' | 'team' | 'invoices' | 'analytics' | 'education' | 'assets' | 'strategy' | 'factory' | 'data-lab';

export interface Card {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  status: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}
