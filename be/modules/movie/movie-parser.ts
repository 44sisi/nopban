import cheerio from 'cheerio';
import {
  MovieSearchItem,
  MovieSearchPagination,
  NameLinkModel,
  Movie,
} from '../../models/movie.model';
import { getBase64 } from '../../lib/util';

function parseMovieSearch(
  html: string
): { items: MovieSearchItem[]; pagination: MovieSearchPagination[] } {
  const $ = cheerio.load(html, { normalizeWhitespace: true });

  // parse movie items
  const items: MovieSearchItem[] = [];
  $('.item-root').each((i, el) => {
    const url = $(el).find('.title-text').attr('href');

    if (url.includes('subject')) {
      const title = $(el).find('.title-text').text();
      const metas = $(el)
        .find('.meta')
        .map((i, e) => $(e).text())
        .get();

      items.push({
        url,
        title,
        metas,
      });
    }
  });

  // parse movie pagination
  const pagination: MovieSearchPagination[] = [];
  $('.paginator a').each((i, el) => {
    const url = $(el).attr('href');
    const start = url ? +url.split('=').reverse()[0] : null;

    const text = $(el).text();
    pagination.push({ start, text });
  });

  return { items, pagination };
}

async function parseMovie(html: string): Promise<Movie> {
  const $ = cheerio.load(html);

  const title = $('h1 span:first-child').text();
  const year = +$('h1 .year').text().substring(1, 5);

  const posterSrc = $('.subject img').attr('src');
  const poster = await getBase64(posterSrc);

  const directors: NameLinkModel[] = [];
  $('a[rel="v:directedBy"]').each((idx, el) => {
    const name = $(el).text();
    const link = $(el).attr('href');
    directors.push({ name, link });
  });

  const playwriters: NameLinkModel[] = [];
  $('span:contains("编剧")')
    .find('a')
    .each((idx, el) => {
      const name = $(el).text();
      const link = $(el).attr('href');
      playwriters.push({ name, link });
    });

  const actors: NameLinkModel[] = [];
  $('.actor a[rel="v:starring"]').each((idx, el) => {
    const name = $(el).text();
    const link = $(el).attr('href');
    actors.push({ name, link });
  });

  const genres: string[] = [];
  $('span[property="v:genre"]').each((idx, el) => {
    const genre = $(el).text();
    genres.push(genre);
  });

  const website = $('span:contains("官方网站")').next().attr('href');

  const countries = $('span:contains("制片国家")')
    .get(0)
    .nextSibling.data.split('/')
    .map((c: string) => c.trim());

  const languages = $('span:contains("语言")')
    .get(0)
    .nextSibling.data.split('/')
    .map((l: string) => l.trim());

  const releaseDates: string[] = [];
  $('span[property="v:initialReleaseDate"]').each((i, e) => {
    releaseDates.push($(e).attr('content'));
  });

  const aliases = $('span:contains("又名")')
    .get(0)
    .nextSibling.data.split('/')
    .map((a: string) => a.trim());

  const imdb = $('a:contains("tt")').attr('href');

  return {
    title,
    year,
    poster,
    directors,
    playwriters,
    actors,
    genres,
    website,
    countries,
    languages,
    releaseDates,
    aliases,
    imdb,
  };
}

export { parseMovieSearch, parseMovie };
