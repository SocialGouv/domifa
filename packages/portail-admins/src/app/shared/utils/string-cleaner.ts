export const cleanString = (str: string) => {
  if (!str) {
    return str;
  }
  return (
    str
      .trim()
      // eslint-disable-next-line no-useless-escape
      .replace(/[&\/\\#,+()$~%.\'\":*?<>{}]/gi, "")
      .replace(/\s+/g, " ")
  );
};
