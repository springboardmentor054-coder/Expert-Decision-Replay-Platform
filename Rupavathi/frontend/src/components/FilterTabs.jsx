import './FilterTabs.css';

function FilterTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="filter-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={
            tab === activeTab ? 'filter-tab filter-tab-active' : 'filter-tab'
          }
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default FilterTabs;