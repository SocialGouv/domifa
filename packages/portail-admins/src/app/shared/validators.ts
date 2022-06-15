export const regexp = {
  date: /^([0-9]|[0-2][0-9]|(3)[0-1])(\/)(([0-9]|(0)[0-9])|((1)[0-2]))(\/)\d{4}$/,
  email:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // eslint-disable  max-len
  phone: /^((\+)33|0)[1-9](\d{2}){4}$/,
  mobilePhone: /^(06|07)(\d{2}){4}$/,
  postcode: /^[0-9][0-9AB][0-9]{3}$/,
};
