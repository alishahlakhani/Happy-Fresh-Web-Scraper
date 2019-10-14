export interface HFStoreModel {
  id: number;
  name: string;
  address: string;
  phone: string;
  location: {
    lat: number;
    lon: number;
  };
  photo: string;
}

export interface AppStoreModel {
  id: number;
  name: string;
  address: string;
  phone: string;
  location: {
    lat: number;
    lon: number;
  };
  photo: string;
}
