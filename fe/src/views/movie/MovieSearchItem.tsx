import axios from 'axios';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { handleError } from '../../lib/util';
import { MovieSearchItemType } from '../../models/movie.model';
import { AuthContext } from '../../store/AuthProvider';

function MovieSearchItem(props: {
  movie: MovieSearchItemType;
  idx: number;
  refreshResult: (idx: number, movie: MovieSearchItemType) => void;
}) {
  const { context, dispatch } = useContext(AuthContext);
  const { idx, movie, refreshResult } = props;

  function addMovie() {
    axios({
      method: 'post',
      url: '/api/movie/object',
      data: { url: movie.url },
      headers: {
        Authorization: 'Bearer ' + context?.token,
      },
    })
      .then(function (res) {
        const m = res.data as MovieSearchItemType;
        refreshResult(idx, m);
        toast.success(`${m.title} 添加成功.`);
      })
      .catch(handleError);
  }

  function gotoMovie(url: string) {
    dispatch({
      type: 'UPDATE_IFRAME',
      iframeUrl: url,
    });
  }

  return (
    <div className="search-item">
      {movie.saved && (
        <img src={'data:image;base64,' + movie.poster} alt={movie.title}></img>
      )}

      <div className="info">
        {movie.saved ? (
          <Link to={`/movie/${movie.url}`}>{movie.title}</Link>
        ) : (
          <button className="title" onClick={() => gotoMovie(movie.url)}>
            {movie.title}
          </button>
        )}
        {context?.isAuthenticated && !movie.saved && (
          <button className="add" title="添加" onClick={addMovie}>
            <i className="fa fa-plus"></i>
          </button>
        )}

        {movie.metas?.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>
    </div>
  );
}

export default MovieSearchItem;
