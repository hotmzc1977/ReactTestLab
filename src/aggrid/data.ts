export interface IWOData {
  workorder: string;
  woSpan?: number;
  res?: string;
  resSpan?: number;
  crew?: string;
  start?: number;
  end?: number;
}

export const wodata = [
  {
    workorder: "100001 Order 1",
    woSpan: 4,
    res: "DRACOPE1",
    resSpan: 2,
    crew: "Mike",
    start: 1,
    end: 4,
  },
  {
    workorder: "100001 Order 1",
    res: "DRACOPE1",
    crew: "John",
    start: 1,
    end: 3,
  },
  {
    workorder: "100001 Order 1",
    res: "DRADAPL",
    resSpan: 2,
    crew: "David",
    start: 2,
    end: 4,
  },
  {
    workorder: "100001 Order 1",
    res: "DRADAPL",
    crew: "Koh",
    start: 2,
    end: 5,
  },
  {
    workorder: "100002 Order 2",
    woSpan: 4,
    res: "DRACOPE1",
    resSpan: 2,
    crew: "Mike",
    start: 1,
    end: 4,
  },
  {
    workorder: "100002 Order 2",
    res: "DRACOPE1",
    crew: "John",
    start: 1,
    end: 3,
  },
  {
    workorder: "100002 Order 2",
    res: "DRADAPL",
    resSpan: 2,
    crew: "David",
    start: 2,
    end: 4,
  },
  {
    workorder: "100002 Order 2",
    res: "DRADAPL",
    crew: "Koh",
    start: 12,
    end: 15,
  },
  {
    workorder: "100003 Order 3",
    woSpan: 4,
    res: "DRACOPE1",
    resSpan: 2,
    crew: "Mike",
    start: 11,
    end: 14,
  },
  {
    workorder: "100003 Order 3",
    res: "DRACOPE1",
    crew: "John",
    start: 21,
    end: 23,
  },
  {
    workorder: "100003 Order 3",
    res: "DRAELEC",
    resSpan: 2,
    crew: "Tan",
    start: 21,
    end: 24,
  },
  {
    workorder: "100003 Order 3",
    res: "DRAELEC",
    crew: "Joe",
    start: 21,
    end: 24,
  },
  {
    workorder: "100004 Order 4",
    res: "DRAELEC",
  },
  {
    workorder: "100005 Order 5",
  },
  {
    workorder: "100006 Order 6",
  },
];

export const stringToColour = (str: string): string => {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = "#";
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
};

export const Resources = [
  "DRACOPE1",
  "DRADAPL",
  "DRACOPE2",
  "DRAELEC",
  "DRAELEC1",
  "DRACLC",
];

export const Crews = [
  { name: "May", res: "DRACOPE1" },
  { name: "Mike", res: "DRACOPE1" },
  { name: "John", res: "DRACOPE1" },
  { name: "David", res: "DRADAPL" },
  { name: "Koh", res: "DRADAPL" },
  { name: "Tan", res: "DRAELEC" },
  { name: "Joe", res: "DRAELEC" },
  { name: "Miller", res: "DRAELEC1" },
  { name: "James", res: "DRACLC" },
  { name: "Amos", res: "DRACLC" },
];
