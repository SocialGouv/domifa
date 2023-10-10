import axios from "axios";
import { FeatureCollection } from "geojson";
import { formatAddressForURL } from "../../util";

export const getLocation = async (
  address: string,
  postCode?: string
): Promise<any> => {
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

    const response: FeatureCollection = (await axios.get(apiUrl, { params }))
      .data;

    if (!response.features.length) {
      console.log(
        "[GET LOCATION] Cannot get location from this address " + address
      );
      return null;
    }
    return response.features[0].geometry;
  } catch (error) {
    console.log(
      "[GET LOCATION] Cannot get location from this address " + address
    );
    return null;
  }
};
