export interface AvailableDigitalBillboard {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  maxSpots: number;
  spotsUsed: number;
  spotsRemaining: number;
  imageUrl: string | null;
  departmentId: number | null;
  departmentName: string | null;
}
