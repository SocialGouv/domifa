export const environment = {
  apiUrl: "http://localhost:3000/",
  production: false,
  env: "dev", // DOMIFA_ENV_ID
  healthzCheck: {
    initialCheckDelay: 60,
    checkPeriodIfSuccess: 600,
    checkPeriodIfError: 5,
  },
};
