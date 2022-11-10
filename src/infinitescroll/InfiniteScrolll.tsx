import React, { useEffect, useRef, useState } from "react";
import { useQueryBook } from "./UseQueryBook";

export default function InfiniteScroll() {
  const [searchText, setSearchText] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1)
  const { books, isLoading, hasMore, error } = useQueryBook(searchText, pageNumber)

  const elementRef = useRef<HTMLParagraphElement>(null);

  const [observer] = useState<IntersectionObserver>(() => new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    console.log(entries, "IntersectionObserver")
    const entry = entries[0]
    if (entry && entry.isIntersecting) {
      setPageNumber(prePN => prePN + 1)
    }
  }, { root: null }))

  useEffect(() => {
    if (elementRef.current) {
      observer.observe(elementRef.current)
      console.log("observe")
    }
    return () => {
      if (elementRef.current) { observer.unobserve(elementRef.current); console.log("unobserve") }
    }
  }, [elementRef.current, observer])

  const handleChange = (e: any) => {
    setSearchText(e.target.value);
  };

  const handleClick = () => {
    setPageNumber(prePageNumber => prePageNumber + 1)
  }

  console.log(books, elementRef.current, observer, "InfiniteScroll")
  return (
    <div>
      <input type="text" value={searchText} onChange={handleChange} />
      <input type="button" value={pageNumber} onClick={handleClick} />
      {
        books.map((book, i: number) => {
          if (i < books.length - 1) { return <p key={book}>{i + 1}:{book}</p> }
          else { return <p key={book} data-id={i + 1} ref={elementRef}>{i + 1}:{book}</p> }
        })
      }
      {isLoading && <p style={{ color: "orange" }}>loading</p>}
      {!hasMore && <p style={{ color: "green" }}>end</p>}
      {error && <p style={{ color: "red" }}>error</p>}
    </div>
  );
}
