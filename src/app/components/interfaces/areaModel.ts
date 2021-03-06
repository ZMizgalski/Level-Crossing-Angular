export interface UpdateAreaModel {
   id?: string;
   oldAreaName?: string;
   area?: Area;
}

export interface AreaModel {
   id?: string;
   area?: Area;
}

export interface Area {
   areaName?: string;
   pointsList?: Point[];
}

export interface Point {
   x?: Number;
   y?: Number;
}
