export function Breadcrumbs({ path, onNavigate }) {
  return (
    <div className="breadcrumbs">
      {path.map((item, i) => (
        <span key={item.id} className="breadcrumb-item">
          {i > 0 && <span className="breadcrumb-sep">/</span>}
          {i === path.length - 1
            ? <span className="breadcrumb-current">{item.name}</span>
            : <button className="breadcrumb-link" onClick={() => onNavigate(item.id, i)}>{item.name}</button>}
        </span>
      ))}
    </div>
  );
}
