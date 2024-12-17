import axios from "axios";
import { FeatureCollection, Point } from "geojson";
import { appLogger, formatAddressForURL } from "../../util";

export interface FrenchAddress {
  id: string;
  score: number;
  housenumber?: string;
  name?: string;
  postcode: string;
  citycode: string;
  city: string;
  district?: string;
  oldcitycode?: string;
  oldcity?: string;
  context: string;
  label: string;
  x: number;
  y: number;
  importance: number;
}

export type FrenchApiAddressResponse = FeatureCollection<Point, FrenchAddress>;

export interface FrenchPoi {
  id: string;
  score: number;
  type?: string;
  toponym: string;
  name: string[];
  postcode: string[];
  citycode: string[];
  city: string[];
  extrafields?: {
    population: string;
    status?: string;
    codes_insee_des_communes_membres: string[];
  };
}

export type FrenchApiPoiResponse = FeatureCollection<
  Point,
  FrenchPoi & FrenchAddress
>;

export const getLocation = async (address: string): Promise<Point | null> => {
  try {
    const apiUrl = "https://data.geopf.fr/geocodage/search";

    const params: {
      q: string;
      limit: number;
      index: string;
    } = {
      q: formatAddressForURL(address),
      limit: 1,
      index: "poi,address",
    };

    if (params.q?.length < 3) {
      // French api needs 3 characters
      return null;
    }

    const response = await axios.get<FeatureCollection<Point, FrenchAddress>>(
      apiUrl,
      {
        params,
        timeout: 4000,
      }
    );

    if (!response.data.features.length) {
      appLogger.warn(
        `[GET LOCATION] Cannot get location from this address ${address}`
      );
      return null;
    }

    return response.data.features[0].geometry;
  } catch (error) {
    appLogger.warn(
      `[GET LOCATION] Cannot get location from this address ${address}`
    );
    return null;
  }
};
