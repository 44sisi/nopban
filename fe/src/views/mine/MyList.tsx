import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Pagination from '../../components/Pagination';
import { CATEGORIES, DICT_NOUN, DICT_VERB } from '../../lib/constant';
import { handleError, useQuery } from '../../lib/util';
import { BookSearchItem, BookSubList } from '../../models/book.model';
import { MovieSearchItem, MovieSubList } from '../../models/movie.model';
import { MusicSearchItem, MusicSubList } from '../../models/music.model';
import { AuthContext } from '../../store/AuthProvider';
import BookItem from '../book/BookItem';
import MovieItem from '../movie/MovieItem';
import MusicItem from '../music/MusicItem';

type SubListType = BookSubList | MovieSubList | MusicSubList;
const itemPerPage = 10;

const MyListPage = styled.div`
  margin: auto;
  width: 84%;
`;

const Title = styled.div`
  font-size: 26px;
  font-weight: bold;
  margin: 30px 0px;
  color: #494949;
`;

const Info = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: #999;
  font-size: 13px;
  margin-bottom: 30px;
  border-bottom: 1px dashed #ddd;
  padding-bottom: 5px;
`;

const MyList = () => {
  const { context } = useContext(AuthContext);
  const token = context?.token;
  const [result, setResult] = useState<SubListType>({
    items: [],
    total: 0,
  });
  const pathname = useLocation().pathname;
  const category = pathname.substring(pathname.lastIndexOf('/') + 1);

  const lastPage = Math.ceil((result?.total * 1.0) / itemPerPage);
  const currentPage = usePageParam(lastPage);
  const startNumber = (currentPage - 1) * itemPerPage + 1;
  const endNumber =
    currentPage * itemPerPage < result?.total
      ? currentPage * itemPerPage
      : result?.total;

  function usePageParam(lastPage: number) {
    const p = +(useQuery().get('p') || 1);
    if (lastPage) {
      return p < 1 || isNaN(p) ? 1 : p > lastPage ? lastPage : p;
    } else {
      return p < 1 || isNaN(p) ? 1 : p;
    }
  }

  useEffect(() => {
    if (token) {
      axios
        .get(`/api/mine/sublist`, {
          params: {
            category: category,
            count: itemPerPage,
            offset: itemPerPage * (currentPage - 1),
          },
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })
        .then((res) => {
          setResult(res.data);
        })
        .catch(handleError);
    }
  }, [category, currentPage, token]);

  return CATEGORIES.includes(category) ? (
    <MyListPage>
      <Title>
        我{DICT_VERB[category]}过的{DICT_NOUN[category]}({result?.total})
      </Title>
      <Info>
        <span>按时间排序</span>
        <span>
          {startNumber}-{endNumber} / {result?.total}
        </span>
      </Info>
      <ItemList category={category} result={result}></ItemList>
      <Pagination currentPage={currentPage} lastPage={lastPage}></Pagination>
    </MyListPage>
  ) : (
    <></>
  );
};

export default MyList;

function ItemList(props: { category: string; result: SubListType }) {
  const { category, result } = props;
  switch (category) {
    case 'book':
      return (
        <div>
          {(result as BookSubList).items?.map(
            (item: BookSearchItem, idx: number) => (
              <BookItem key={idx} book={item}></BookItem>
            )
          )}
        </div>
      );
    case 'movie':
      return (
        <div>
          {(result as MovieSubList).items?.map(
            (item: MovieSearchItem, idx: number) => (
              <MovieItem key={idx} movie={item}></MovieItem>
            )
          )}
        </div>
      );
    case 'music':
      return (
        <div>
          {(result as MusicSubList).items?.map(
            (item: MusicSearchItem, idx: number) => (
              <MusicItem key={idx} music={item}></MusicItem>
            )
          )}
        </div>
      );
    default:
      return <></>;
  }
}
