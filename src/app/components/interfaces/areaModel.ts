export interface UpdateAreaModel {
   id?: string;
   oldAreaName?: string;
   area?: Area;
}

export interface AreaModel {
   id?: string;
   area?: Area;
}

export interface RawArea {
   areaName?: string;
   poinstList?: Point[];
}

export interface Area {
   areaName?: string;
   pointsList?: Point[];
}

export interface Point {
   x?: Number;
   y?: Number;
}
