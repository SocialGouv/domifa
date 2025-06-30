import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response && error.response.status >= 500)
    );
  },
});

export function createAxiosInstanceWithRetry(baseConfig = {}) {
  const instance = axios.create(baseConfig);

  axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response && error.response.status >= 500)
      );
    },
  });

  return instance;
}

export { axios };
export default axios;
