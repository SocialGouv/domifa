export const environment = {
  apiUrl: "http://localhost:3000/",
  production: true,
  env: "test",
  healthzCheck: {
    initialCheckDelay: 3600,
    checkPeriodIfSuccess: 3600,
    checkPeriodIfError: 3600,
  },
};
