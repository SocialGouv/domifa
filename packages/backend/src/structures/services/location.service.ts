import axios from "axios";
import { FeatureCollection, Point } from "geojson";
import { formatAddressForURL } from "../../util";

export interface BanAddress {
  label: string;
  score: number;
  housenumber: string;
  id: string;
  name: string;
  postcode: string;
  citycode: string;
  x: number;
  y: number;
  city: string;
  district: string;
  context: string;
  type: string;
  importance: number;
  street: string;
}

export const getLocation = async (
  address: string,
  postCode?: string
): Promise<Point | null> => {
  try {
    const apiUrl = "https://api-adresse.data.gouv.fr/search/";
    let params: {
      q: string;
      postcode?: string;
      type: string;
    } = { q: formatAddressForURL(address), type: "street" };

    if (postCode) {
      params = { ...params, postcode: postCode };
    }

    const response = await axios.get<FeatureCollection<Point, BanAddress>>(
      apiUrl,
      {
        params,
      }
    );

    if (!response.data.features.length) {
      console.log(
        "[GET LOCATION] Cannot get location from this address " + address
      );
      return null;
    }
    return response.data.features[0].geometry;
  } catch (error) {
    console.log(
      "[GET LOCATION] Cannot get location from this address " + address
    );
    return null;
  }
};
