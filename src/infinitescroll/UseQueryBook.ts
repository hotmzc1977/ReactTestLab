import axios from "axios";
import { useEffect, useState } from "react";

export function useQueryBook(searchText: string, pageNumber: number) {
  const [books, setBooks] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setBooks([]);
  }, [searchText]);

  useEffect(() => {
    setHasMore(false);
    setIsloading(true);
    let cancel: any;
    axios
      .get("https://openlibrary.org/search.json", {
        params: {
          q: searchText,
          page: pageNumber,
        },
        cancelToken: new axios.CancelToken((c) => (cancel = c)),
      })
      .then((res: any) => res.data)
      .then((data: any) => {
        setBooks((prevBooks) => {
          const newBooks: string[] = [
            ...new Set<string>([
              ...prevBooks,
              ...data.docs.map((doc: any) => doc.title as string),
            ]),
          ];
          return newBooks;
        });
        setIsloading(false);
        setHasMore(data.docs.length > 0);
      })
      .catch((e: any) => {
        if (axios.isCancel(e)) return;
        setError(true);
      });

    return () => cancel();
  }, [searchText, pageNumber]);

  return { books, isLoading, hasMore, error };
}
