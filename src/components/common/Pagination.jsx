export default function Pagination({ pageNum, pageCount, total, setPageNum }) {
  return <div className="pagination"><span>Showing <strong>{total ? (pageNum - 1) * 6 + 1 : 0}–{Math.min(pageNum * 6, total)}</strong> of <strong>{total}</strong> records</span><div><button disabled={pageNum <= 1} onClick={() => setPageNum(pageNum - 1)}>← Previous</button><span>{pageNum} / {pageCount}</span><button disabled={pageNum >= pageCount} onClick={() => setPageNum(pageNum + 1)}>Next →</button></div></div>;
}
