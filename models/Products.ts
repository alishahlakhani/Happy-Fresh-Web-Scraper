export interface HFProductsModel {
  count: number;
  total_count: number;
  pages: number;
  search_id: number;
  current_page: number;
  per_page: number;
  query?: any;
  products: Product[];
  filters: Filters;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  in_stock: boolean;
  supermarket_unit_cost_price: number;
  display_supermarket_unit_cost_price: string;
  normal_price: string;
  display_normal_price?: any;
  price: string;
  display_price: string;
  unit_price: string;
  display_unit_price: string;
  display_promo_price_percentage: string;
  display_promotion_actions_combination_text: string;
  promotion_actions: any[];
  display_unit: string;
  supermarket_unit: string;
  natural_average_weight: number;
  display_average_weight: string;
  max_order_quantity: number;
  popularity: number;
  taxon_ids: number[];
  variants: Variant[];
  score: number;
  promotion_score: number;
  categories: any[];
  product_type_name: string;
  display_banner_text: any[];
  brand?: any;
  promotions: any[];
}

interface Variant {
  id: number;
  name: string;
  description: string;
  in_stock: boolean;
  sku: string;
  is_master: boolean;
  images: Image[];
  track_inventory: boolean;
}

interface Image {
  id: number;
  position: number;
  alt: string;
  mini_url: string;
  small_url: string;
  product_url: string;
  product_hq_url: string;
  large_url: string;
  original_url: string;
  attachment_updated_at: string;
}

interface Filters {
  taxon_ids: number[];
  brands: Brand[];
}

interface Brand {
  id: number;
  name: string;
}

export interface AppProductsModel {
  id: number;
  name: string;
  description: string;
  supermarket_unit_cost_price: number;
  display_supermarket_unit_cost_price: string;
  normal_price: string;
  display_normal_price?: any;
  price: string;
  display_price: string;
  unit_price: string;
  display_unit_price: string;
  display_promo_price_percentage: string;
  display_promotion_actions_combination_text: string;
  display_unit: string;
  supermarket_unit: string;
  natural_average_weight?: any;
  display_average_weight: string;
  sku: string;
  images: Image[] | null;
}
