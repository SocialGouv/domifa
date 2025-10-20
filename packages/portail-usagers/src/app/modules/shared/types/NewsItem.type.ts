export type NewsItem = {
  date: string;
  description: string;
  content: {
    type: string;
    categorie: string;
    message: string[];
  }[];
};
