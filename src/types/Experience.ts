export interface Experience {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  short_desc?: string;
  description?: string;
  base_price?: number;
  images?: string[];
  thumbnail_url?: string;
  template_type?: 'standard' | 'special';
  is_featured?: boolean;
  created_at?: string;
}

export interface CreateExperienceData {
  title: string;
  category: string;
  subcategory?: string;
  short_desc?: string;
  description?: string;
  base_price?: number;
  images?: string[];
  thumbnail_url?: string;
  template_type?: 'standard' | 'special';
  is_featured?: boolean;
}

export interface ExperienceFilters {
  category?: string;
  subcategory?: string;
  is_featured?: boolean;
  template_type?: 'standard' | 'special';
}
