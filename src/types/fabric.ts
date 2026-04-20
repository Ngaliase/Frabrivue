export type BilingualObject = Record<string, string>;

export interface Fabric {
  id: number;
  type: string | null;
  name: BilingualObject;
  url?: string | null;
  image_url: string | null;
  meta_description?: BilingualObject | null;
  about_text?: BilingualObject | null;
  tags?: string[] | null;
  seasons?: string[] | null;
  categories?: string[] | null;
  age_groups?: string[] | null;
  style_concepts?: string[] | null;
  technical_properties?: Record<string, any> | null;
  applications?: Array<Record<string, any>> | null;
  care_instructions?: BilingualObject | null;
  additional_info?: BilingualObject | null;
}

export interface MoodItem {
  id: number;
  fabric: Fabric;
  note: string | null;
  added_at: string;
}
