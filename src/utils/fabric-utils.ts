import { BilingualObject } from "@/types/fabric";

/**
 * Extracts a localized string from a bilingual object.
 * Falls back to the current locale, then to 'vi', then to 'en', then to an empty string.
 */
export function getLocaleValue(
  obj: BilingualObject | null | undefined,
  locale: string
): string {
  if (!obj) return "";
  
  // If it's already a string (legacy data), return it
  if (typeof obj === 'string') return obj;

  return obj[locale] || obj["vi"] || obj["en"] || "";
}

/**
 * Vietnamese labels for technical property keys.
 */
export const TECHNICAL_PROP_LABELS: Record<string, string> = {
  weight_gsm: "Trọng lượng (gsm)",
  thickness_mm: "Độ dày (mm)",
  width_cm: "Khổ rộng (cm)",
  wales_per_inch: "Wales per inch",
  courses_per_inch: "Courses per inch",
  knit_gauge: "Knit gauge",
  warp_stretch: "Độ giãn dọc",
  weft_stretch: "Độ giãn ngang",
  air_permeability_cfm: "Độ thoáng khí (cfm)",
  water_resistance_mm: "Kháng nước (mm)",
  spray_rating: "Chỉ số Spray",
  upf_rating: "Chỉ số UPF",
  luster: "Độ bóng",
  opacity: "Độ đục",
  surface_texture: "Bề mặt vải",
  hand_drape: "Độ rủ",
  ends_per_inch: "Ends per inch",
  picks_per_inch: "Picks per inch",
};

/**
 * Vietnamese translations for common English values.
 */
export const TECHNICAL_PROP_VALUES: Record<string, string> = {
  smooth: "Mịn",
  fluid: "Mềm rủ",
  opaque: "Đục",
  "semi opaque": "Nửa đục",
  "semi bright": "Nửa sáng",
  "semi matte": "Hơi mờ",
  matte: "Mờ",
  bright: "Sáng",
  "high luster": "Độ bóng cao",
  balanced: "Cân bằng",
  stiff: "Cứng",
  rough: "Thô",
  soft: "Mềm",
  "delicate, embroidered": "Tinh tế, thêu",
};

/**
 * Returns a localized label for a technical property key.
 */
export function getLocalizedPropLabel(key: string, locale: string): string {
  if (locale === "vi") {
    return TECHNICAL_PROP_LABELS[key] || key.replace(/_/g, " ");
  }
  return key.replace(/_/g, " ");
}

/**
 * Returns a localized value for a technical property.
 */
export function getLocalizedPropValue(value: any, locale: string): string {
  const baseValue = getLocaleValue(value as any, locale);
  
  if (locale === "vi") {
    const lowerValue = baseValue.toLowerCase().trim();
    return TECHNICAL_PROP_VALUES[lowerValue] || baseValue;
  }
  
  return baseValue;
}
