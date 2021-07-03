import { Area } from './areaModel';
export interface CameraModel {
  id?: string;
  ip?: string;
  connectionId?: string;
  selectedAreas?: Area[];
}
