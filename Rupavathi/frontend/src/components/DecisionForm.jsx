import { useState } from 'react';
import CustomSelect from './CustomSelect';
import './DecisionForm.css';

const STATUS_OPTIONS = ['Draft', 'Under Review', 'Approved', 'Rejected'];

function DecisionForm({
  categories,
  initialValues,
  showStatus = false,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [problemStatement, setProblemStatement] = useState(initialValues?.problem_statement || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [categoryId, setCategoryId] = useState(
    initialValues?.category_id ? String(initialValues.category_id) : ''
  );
  const [status, setStatus] = useState(initialValues?.status || 'Draft');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title cannot be empty.';
    if (!problemStatement.trim()) errors.problemStatement = 'Problem statement is mandatory.';
    if (!categoryId) errors.category = 'Please select a category.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validate()) return;

    const payload = {
      title: title.trim(),
      problem_statement: problemStatement.trim(),
      description: description.trim() || null,
      category_id: Number(categoryId),
    };

    if (showStatus) {
      payload.status = status;
    }

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
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Migrate MySQL to PostgreSQL"
        />
        {fieldErrors.title && <p className="decision-form-field-error">{fieldErrors.title}</p>}
      </div>

      <div className="decision-form-field">
        <label htmlFor="problem_statement">
          Problem Statement <span className="required">*</span>
        </label>
        <textarea
          id="problem_statement"
          rows={4}
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          placeholder="What problem is this decision solving?"
        />
        {fieldErrors.problemStatement && (
          <p className="decision-form-field-error">{fieldErrors.problemStatement}</p>
        )}
      </div>

      <div className="decision-form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional context (optional)"
        />
      </div>

      <div className="decision-form-row">
        <div className="decision-form-field">
          <label htmlFor="category">
            Category <span className="required">*</span>
          </label>
          <CustomSelect
            id="category"
            value={categoryId}
            onChange={setCategoryId}
            placeholder="Select a category"
            error={Boolean(fieldErrors.category)}
            options={categories.map((category) => ({
              value: String(category.id),
              label: category.name,
            }))}
          />
          {fieldErrors.category && <p className="decision-form-field-error">{fieldErrors.category}</p>}
        </div>

        {showStatus && (
          <div className="decision-form-field">
            <label htmlFor="status">Status</label>
            <CustomSelect
              id="status"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS.map((option) => ({ value: option, label: option }))}
            />
          </div>
        )}
      </div>

      {!showStatus && (
        <p className="decision-form-hint">
          New decisions are always created with status <strong>Draft</strong>.
        </p>
      )}

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

export default DecisionForm;
