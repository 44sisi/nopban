import { Request, Response } from 'express';
import puppet from '../../puppet';
import parseMovieSearch from './movie-search-parser';

const searchMovie = async (request: Request, response: Response) => {
  const searchKey = encodeURI(request.query.searchKey as string);
  const start = request.query.start || '0';
  const url = `https://search.douban.com/movie/subject_search?search_text=${searchKey}&start=${start}`;

  const page = await puppet();

  try {
    await page.goto(url);
    await page.waitForSelector('#root');
    const bodyHTML = await page.evaluate(
      () => document.getElementById('root').innerHTML
    );
    const resuls = parseMovieSearch(bodyHTML);

    response.status(200).json(resuls);
  } catch (e) {
    console.warn(e);
    response.status(500).json({ error: 'Error in fetching search results' });
  } finally {
    await page.close();
  }
};

export default searchMovie;