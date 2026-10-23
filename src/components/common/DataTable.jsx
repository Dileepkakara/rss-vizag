export default function DataTable({ headings, children, className = '' }) {
  return <div className="responsive-table"><table className={className}><thead><tr>{headings.map((heading, index) => {
    const label = typeof heading === 'string' ? heading : heading.label;
    const ariaLabel = typeof heading === 'string' ? undefined : heading.ariaLabel;
    return <th key={`${label || ariaLabel || 'column'}-${index}`} aria-label={ariaLabel}>{label}</th>;
  })}</tr></thead><tbody>{children}</tbody></table></div>;
}
