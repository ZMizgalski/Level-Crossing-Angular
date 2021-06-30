export interface AreaModel {
  id?: string;
  area?: Area;
}

export interface Area {
  areaName?: string;
  pointsList?: Point[];
}

export interface Point {
  x?: number;
  y?: number;
}
