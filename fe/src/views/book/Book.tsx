import React from 'react';
import SearchBar from '../../components/SearchBar';

const Book = () => {
  const [searchKey, setSearchKey] = React.useState<string>('');
  function search() {}

  return (
    <>
      <SearchBar
        searchKey={searchKey}
        setSearchKey={setSearchKey}
        onButtonClick={search}
      ></SearchBar>
      <main>
        <h1>黄金时代</h1>
      </main>
    </>
  );
};

export default Book;
