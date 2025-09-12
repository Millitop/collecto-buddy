export interface User {
  id: string;
  email: string;
  country: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  category: string;
  subcategory?: string;
  title: string;
  maker_brand?: string;
  year_or_period?: string;
  set_or_model?: string;
  identifiers: string[];
  condition_grade: string;
  condition_notes?: string;
  authenticity_flags: string[];
  price_low?: number;
  price_mid?: number;
  price_high?: number;
  images: string[];
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  item_id: string;
  source: string;
  price: number;
  currency: string;
  sold_at: string;
  created_at: string;
}

export interface AnalysisData {
  category: string;
  subcategory: string;
  title: string;
  maker_brand: string;
  year_or_period: string;
  set_or_model: string;
  identifiers: string[];
  condition: {
    grade: string;
    notes: string;
  };
  authenticity_flags: string[];
  price_estimate_SEK: {
    low: number;
    mid: number;
    high: number;
    sources: string[];
  };
  next_shots: string[];
  confidence: number;
}