import { useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
// import { searchMQ } from '../openaiquery2';

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const result = await searchMQ(searchText);
      setAnswer(result.answer);
    } catch (error) {
      console.error(error);
      setAnswer('Error searching for answer');
    }
  };

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Image src="/Ilm.png" width={500} height={500} />
        <form onSubmit={handleSearch} className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleInputChange}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            <Image src="/magnify.svg" alt="Search" width={40} height={40} />
          </button>
        </form>
        {answer && (
          <div className={styles.answerContainer}>
            <p className={styles.answer}>{answer}</p>
          </div>
        )}
      </main>
    </div>
  );
}