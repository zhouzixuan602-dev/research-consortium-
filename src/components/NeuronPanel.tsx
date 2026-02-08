import type { Neuron } from '../types';

interface Props {
  neurons: Neuron[];
}

export default function NeuronPanel({ neurons }: Props) {
  return (
    <div className="neuron-panel glass">
      <div className="panel-title">Neuron Activation</div>
      {neurons.length === 0 && (
        <div className="empty-state" style={{ padding: '20px 0' }}>
          <p style={{ fontSize: '0.82rem' }}>No neurons active yet. Interact to fire spikes!</p>
        </div>
      )}
      <div className="neuron-grid">
        {neurons.map((n) => (
          <div key={n.id} className="neuron-row">
            <span className="neuron-label" title={n.label}>
              {n.label}
            </span>
            <div className="neuron-bar-track">
              <div
                className={`neuron-bar-fill ${n.network.toLowerCase()}`}
                style={{ width: `${Math.round(n.activation * 100)}%` }}
              />
            </div>
            <span className="neuron-value">{(n.activation * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
