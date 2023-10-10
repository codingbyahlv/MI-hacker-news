import axios from "axios";
import { News } from "./news.types";

//** can I type the extractData to something else than any? Or chould I use something else than "extractData" to get the different data?
const get = async <T>(endpoint: string, extractData: (response: any) => T) => {
  const response = await axios.get<T>(endpoint);
  return extractData(response.data);
};

export const getNews = async (query: string, page: number) => {
  const url = `http://hn.algolia.com/api/v1/search/?query=${query}&tags=story&page=${page}`;
  return get<News[]>(url, (data) => data.hits);
};

export const getResultData = async (query: string) => {
  const url = `http://hn.algolia.com/api/v1/search/?query=${query}&tags=story`;
  return get<number>(url, (data) => data.nbPages);
};
