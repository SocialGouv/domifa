import { Feature, FeatureCollection, Point } from "geojson";
import { appLogger, formatAddressForURL } from "../../../util";
import { axios } from "../../../config";

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

export const getAddress = async (
  address: string
): Promise<Feature<Point, FrenchAddress>> => {
  try {
    const apiUrl = "https://data.geopf.fr/geocodage/search";

    const params: {
      q: string;
      limit: number;
      index: string;
    } = {
      q: formatAddressForURL(address),
      limit: 1,
      index: "address",
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

    return response.data.features[0];
  } catch (error) {
    appLogger.warn(
      `[GET LOCATION] Cannot get location from this address ${address}`
    );
    return null;
  }
};

export const getLocation = async (address: string): Promise<Point | null> => {
  try {
    const place = await getAddress(address);
    return place.geometry;
  } catch (error) {
    appLogger.warn(
      `[GET LOCATION] Cannot get location from this address ${address}`
    );
    return null;
  }
};

export async function getCityCode(structure: {
  nom: string;
  ville: string;
  codePostal: string;
  latitude: number;
  longitude: number;
}): Promise<string | null> {
  const city = structure.ville.toLowerCase().replace("cedex", " ").trim();
  const apiUrl = "https://data.geopf.fr/geocodage/search";
  const params = {
    q: city,
    limit: 1,
    lat: structure.latitude,
    lon: structure.longitude,
    type: "municipality",
    index: "address",
  };

  try {
    const response = await axios.get<FeatureCollection<Point, FrenchAddress>>(
      apiUrl,
      {
        params,
        timeout: 10000,
      }
    );

    if (!response.data.features.length) {
      appLogger.warn(
        `[GET LOCATION] Cannot get location from this city ${city}`
      );
      return null;
    } else {
      const citycode = response.data.features[0].properties.citycode;
      console.log(
        `${structure.nom} - ${city} - ${structure.codePostal} = ${citycode}`
      );
      return citycode;
    }
  } catch (error) {
    appLogger.error(
      `[GET LOCATION] Failed after retries for ${city}: ${error.message}`
    );
    return null;
  }
}
