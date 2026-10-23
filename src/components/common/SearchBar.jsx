export default function SearchBar({ value, onChange, placeholder, label }) {
  return <div className="search-box"><span aria-hidden="true">⌕</span><input value={value} onChange={onChange} placeholder={placeholder} aria-label={label || placeholder} /></div>;
}
