export interface HFTaxonomyModel {
  count: number;
  total_count: number;
  current_page: number;
  per_page: number;
  pages: number;
  taxons: Taxon[];
}

interface Taxon {
  id: number;
  name: string;
  parent_id: number;
  description?: string | null;
  permalink: string;
  taxonomy_id: number;
  meta_description?: string | null;
  meta_keywords?: string | null;
  meta_title?: string | null;
  position: number;
  display_image?: Displayimage;
  products_count: number;
  icon_url: string;
  sorting_unit_price: boolean;
  promises: any[];
  slug: string;
  taxons: Taxon[];
}

interface Displayimage {
  id: number;
  mini: string;
  normal: string;
}

export interface AppTaxonomyModel {
  id: string | number;
  name: string;
  description: string;
  products_count: string | number;
  storeId?: number;
}
