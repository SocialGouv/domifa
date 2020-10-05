// As default, in every files in the "/usr/share/nginx/html" directory, the envsub.sh script replaces %%KEY%% by VALUE where export KEY=VALUE in the global env var.
// https://github.com/SocialGouv/docker/tree/master/nginx4spa
export const environment = {
  apiUrl: "%%DOMIFA_BACKEND_URL%%", // https://domifa-api.fabrique.social.gouv.fr/
  production: true,
};
