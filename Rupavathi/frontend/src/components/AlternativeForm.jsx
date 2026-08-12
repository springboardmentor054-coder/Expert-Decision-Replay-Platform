import { useState } from 'react';
import CustomSelect from './CustomSelect';
import '../components/DecisionForm.css';

const RISK_LEVELS = ['Low', 'Medium', 'High'];

function AlternativeForm({ initialValues, submitLabel = 'Save', onSubmit, onCancel }) {
  const [name, setName] = useState(initialValues?.alternative_name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [pros, setPros] = useState(initialValues?.pros || '');
  const [cons, setCons] = useState(initialValues?.cons || '');
  const [estimatedCost, setEstimatedCost] = useState(
    initialValues?.estimated_cost != null ? String(initialValues.estimated_cost) : ''
  );
  const [feasibility, setFeasibility] = useState(initialValues?.feasibility || '');
  const [riskLevel, setRiskLevel] = useState(initialValues?.risk_level || 'Medium');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Alternative name cannot be empty.';
    if (estimatedCost.trim() && (isNaN(Number(estimatedCost)) || Number(estimatedCost) <= 0)) {
      errors.estimatedCost = 'Cost must be a positive number.';
    }
    if (!riskLevel) errors.riskLevel = 'Please select a risk level.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validate()) return;

    const payload = {
      alternative_name: name.trim(),
      description: description.trim() || null,
      pros: pros.trim() || null,
      cons: cons.trim() || null,
      estimated_cost: estimatedCost.trim() ? Number(estimatedCost) : null,
      feasibility: feasibility.trim() || null,
      risk_level: riskLevel,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (error) {
      setFormError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="decision-form" onSubmit={handleSubmit} noValidate>
      {formError && <p className="decision-form-error">{formError}</p>}

      <div className="decision-form-field">
        <label htmlFor="alternative_name">
          Alternative Name <span className="required">*</span>
        </label>
        <input
          id="alternative_name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Use AWS Database Migration Service"
        />
        {fieldErrors.name && <p className="decision-form-field-error">{fieldErrors.name}</p>}
      </div>

      <div className="decision-form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this alternative?"
        />
      </div>

      <div className="decision-form-row">
        <div className="decision-form-field">
          <label htmlFor="pros">Pros</label>
          <textarea
            id="pros"
            rows={3}
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            placeholder="Advantages of this option"
          />
        </div>

        <div className="decision-form-field">
          <label htmlFor="cons">Cons</label>
          <textarea
            id="cons"
            rows={3}
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            placeholder="Drawbacks of this option"
          />
        </div>
      </div>

      <div className="decision-form-row">
        <div className="decision-form-field">
          <label htmlFor="estimated_cost">Estimated Cost</label>
          <input
            id="estimated_cost"
            type="number"
            min="0"
            step="0.01"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="e.g. 1200"
          />
          {fieldErrors.estimatedCost && (
            <p className="decision-form-field-error">{fieldErrors.estimatedCost}</p>
          )}
        </div>

        <div className="decision-form-field">
          <label htmlFor="feasibility">Feasibility</label>
          <input
            id="feasibility"
            type="text"
            value={feasibility}
            onChange={(e) => setFeasibility(e.target.value)}
            placeholder="e.g. High, Medium, Low"
          />
        </div>

        <div className="decision-form-field">
          <label htmlFor="risk_level">
            Risk Level <span className="required">*</span>
          </label>
          <CustomSelect
            id="risk_level"
            value={riskLevel}
            onChange={setRiskLevel}
            error={Boolean(fieldErrors.riskLevel)}
            options={RISK_LEVELS.map((level) => ({ value: level, label: level }))}
          />
          {fieldErrors.riskLevel && <p className="decision-form-field-error">{fieldErrors.riskLevel}</p>}
        </div>
      </div>

      <div className="decision-form-actions">
        <button type="submit" className="decision-form-submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="decision-form-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default AlternativeForm;
