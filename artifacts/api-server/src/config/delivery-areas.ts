export interface DeliveryArea {
  wilayat: string;
  wilayatAr: string;
  deliveryChargeOmr: number;
  estimatedDays: string;
}

export const DHOFAR_DELIVERY_AREAS: DeliveryArea[] = [
  { wilayat: "Salalah", wilayatAr: "صلالة", deliveryChargeOmr: 1.5, estimatedDays: "1-2" },
  { wilayat: "Taqah", wilayatAr: "طاقة", deliveryChargeOmr: 2.0, estimatedDays: "1-2" },
  { wilayat: "Mirbat", wilayatAr: "مرباط", deliveryChargeOmr: 2.5, estimatedDays: "2-3" },
  { wilayat: "Darbat", wilayatAr: "دربات", deliveryChargeOmr: 2.0, estimatedDays: "1-2" },
  { wilayat: "Thumrait", wilayatAr: "ثمريت", deliveryChargeOmr: 3.0, estimatedDays: "2-3" },
  { wilayat: "Sadah", wilayatAr: "صدح", deliveryChargeOmr: 3.5, estimatedDays: "2-3" },
  { wilayat: "Rakhyut", wilayatAr: "رخيوت", deliveryChargeOmr: 4.5, estimatedDays: "3-4" },
  { wilayat: "Dhalkut", wilayatAr: "ضلكوت", deliveryChargeOmr: 4.5, estimatedDays: "3-4" },
  { wilayat: "Muqshin", wilayatAr: "مقشن", deliveryChargeOmr: 5.0, estimatedDays: "4-5" },
  { wilayat: "Shaleem", wilayatAr: "شليم", deliveryChargeOmr: 5.0, estimatedDays: "4-5" },
];

export function findDeliveryArea(wilayat: string): DeliveryArea | undefined {
  return DHOFAR_DELIVERY_AREAS.find(
    (a) => a.wilayat.toLowerCase() === wilayat.toLowerCase()
  );
}
