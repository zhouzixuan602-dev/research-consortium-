import type { NetworkType, Interest } from '../types';

const NETWORKS: { key: NetworkType | null; label: string; desc: string }[] = [
  { key: null, label: 'All Networks', desc: 'Everything' },
  { key: 'DMN', label: 'DMN', desc: 'Default Mode' },
  { key: 'ECN', label: 'ECN', desc: 'Executive Control' },
  { key: 'PFC', label: 'PFC', desc: 'Prefrontal' },
];

const ALL_TAGS = [
  'ai', 'neuroscience', 'mathematics', 'computing', 'algorithms',
  'biology', 'physics', 'philosophy', 'cognition', 'networks',
  'learning', 'memory', 'attention', 'consciousness', 'language',
];

interface Props {
  selectedNetwork: NetworkType | null;
  onNetworkChange: (n: NetworkType | null) => void;
  interests: Interest[];
  onToggleInterest: (tag: string) => void;
  filterTags: string[];
  onToggleFilterTag: (tag: string) => void;
}

export default function SidebarLeft({
  selectedNetwork,
  onNetworkChange,
  interests,
  onToggleInterest,
  filterTags,
  onToggleFilterTag,
}: Props) {
  const activeTagSet = new Set(interests.filter((i) => i.active).map((i) => i.tag));
  const filterSet = new Set(filterTags);

  return (
    <aside className="sidebar-left">
      <div className="panel glass">
        <div className="panel-title">Networks</div>
        <div className="network-list">
          {NETWORKS.map((n) => (
            <button
              key={String(n.key)}
              className={`network-item ${selectedNetwork === n.key ? 'active' : ''}`}
              onClick={() => onNetworkChange(n.key)}
            >
              {n.key && (
                <span className={`network-dot ${n.key.toLowerCase()}`} />
              )}
              {!n.key && (
                <span
                  className="network-dot"
                  style={{
                    background: 'linear-gradient(135deg, var(--dmn-color), var(--ecn-color), var(--pfc-color))',
                  }}
                />
              )}
              <span>
                {n.label}
                <br />
                <small style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  {n.desc}
                </small>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel glass">
        <div className="panel-title">Filter by Tag</div>
        <div className="tag-list">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              className={`tag-chip ${filterSet.has(tag) ? 'active' : ''}`}
              onClick={() => onToggleFilterTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        {filterTags.length > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 8, width: '100%' }}
            onClick={() => filterTags.forEach(onToggleFilterTag)}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="panel glass">
        <div className="panel-title">My Interests</div>
        <div className="tag-list">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              className={`tag-chip ${activeTagSet.has(tag) ? 'interest-active' : ''}`}
              onClick={() => onToggleInterest(tag)}
            >
              {activeTagSet.has(tag) ? '\u2665 ' : ''}{tag}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
