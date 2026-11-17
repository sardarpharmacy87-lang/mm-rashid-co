export type CraftItem = {
  id: string;
  title: string;
  description: string;
  image_path: string;
  active: boolean;
  sort_order: number;
  updated_at: string;
};

export const CRAFT_BUCKET = "craft-images";
export const CRAFT_IMAGE_PREFIX = "https://gjdyrkbabmdfgxcsvenw.supabase.co/storage/v1/object/public/craft-images/";
