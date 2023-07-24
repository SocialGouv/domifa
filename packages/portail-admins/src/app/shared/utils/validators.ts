/* eslint-disable no-useless-escape */
export const regexp = {
  date: /^(\d|[0-2]\d|(3)[0-1])(\/)((\d|(0)\d)|((1)[0-2]))(\/)\d{4}$/,
  email:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // tslint:disable max-line-length
  phone: /^((\+)33|0)[1-9](\d{2}){4}$/,
  mobilePhone: /^(06|07)(\d{2}){4}$/,
  postcode: /^\d[0-9AB]\d{3}$/,
};

export const password = {
  max: 128,
  min: 6,
};
