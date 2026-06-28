import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { aiModelService } from "@/services/aiModel.service";
import { categoryService } from "@/services/category.service";
import {
  validatorService,
  type AiModelFormData,
  type AiModelValidationErrors,
} from "@/services/validator.service";
import type { AIModel } from "@/models/aiModel.model";
import type { Category } from "@/models/category.model";
import "./AiModelDetailPage.scss";

type Mode = "view" | "edit" | "create";

const EMPTY_MODEL: AiModelFormData = {
  categoryId: 0,
  name: "",
  version: "",
  description: "",
  accuracy: 0,
  creator: "",
  isActive: true,
};

function AiModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isCreate = !id;
  const [mode, setMode] = useState<Mode>(isCreate ? "create" : "view");

  const [model, setModel] = useState<AIModel | null>(null);
  const [formData, setFormData] = useState<AiModelFormData>(EMPTY_MODEL);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<AiModelValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = categoryService.getAllCategories();
    if (isCreate) {
      fetchCategories.then((r) => setCategories(r.data));
      return;
    }
    Promise.all([aiModelService.getAiModelById(Number(id)), fetchCategories])
      .then(([modelRes, catRes]) => {
        setModel(modelRes.data);
        setFormData({
          categoryId: modelRes.data.categoryId,
          name: modelRes.data.name,
          version: modelRes.data.version,
          description: modelRes.data.description,
          accuracy: modelRes.data.accuracy,
          creator: modelRes.data.creator,
          isActive: modelRes.data.isActive,
        });
        setCategories(catRes.data);
      })
      .catch(() => setApiError("Failed to load model data."))
      .finally(() => setLoading(false));
  }, [id, isCreate]);

  const categoryMap = new Map(categories.map((c) => [Number(c.id), c]));
  const currentCategory = model
    ? categoryMap.get(Number(model.categoryId))
    : undefined;

  const accuracyColor = (acc: number) =>
    acc >= 93 ? "success" : acc >= 87 ? "warning" : "danger";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const cast =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : name === "accuracy" || name === "categoryId"
          ? Number(value)
          : value;

    const key = name as keyof AiModelFormData;
    const next = { ...formData, [key]: cast };
    setFormData(next);

    if (submitted) {
      const err = validatorService.validateField(
        key,
        cast as AiModelFormData[typeof key],
      );
      setFieldErrors((prev) => ({ ...prev, [key]: err }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setApiError(null);
    setSuccessMsg(null);

    const { valid, errors } = validatorService.validateAiModel(formData);
    setFieldErrors(errors);
    if (!valid) return;

    setSaving(true);
    try {
      if (isCreate) {
        await aiModelService.insertAiModel(formData);
        setSuccessMsg("Model created successfully!");
        setTimeout(() => navigate("/"), 1200);
      } else {
        const updated = await aiModelService.updateAiModel(
          Number(id),
          formData,
        );
        setModel(updated.data);
        setMode("view");
        setSuccessMsg("Model updated successfully!");
      }
    } catch {
      setApiError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this model? This action cannot be undone."))
      return;
    try {
      await aiModelService.deleteAiModel(Number(id));
      navigate("/");
    } catch {
      setApiError("Failed to delete model.");
    }
  };

  const handleCancelEdit = () => {
    if (model) {
      setFormData({
        categoryId: model.categoryId,
        name: model.name,
        version: model.version,
        description: model.description,
        accuracy: model.accuracy,
        creator: model.creator,
        isActive: model.isActive,
      });
    }
    setFieldErrors({});
    setSubmitted(false);
    setMode("view");
    setApiError(null);
  };

  const cx = (field: keyof AiModelFormData) =>
    submitted && fieldErrors[field]
      ? "is-invalid"
      : submitted
        ? "is-valid"
        : "";

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-detail-page container py-4">
      <button
        className="btn btn-sm btn-outline-secondary mb-4 d-inline-flex align-items-center gap-1"
        onClick={() => navigate("/")}
      >
        ← Back to catalogue
      </button>

      {/* ── API-level alerts ── */}
      {apiError && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {apiError}
          <button
            type="button"
            className="btn-close"
            onClick={() => setApiError(null)}
          />
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success" role="alert">
          {successMsg}
        </div>
      )}

      {/* ── VIEW mode ── */}
      {mode === "view" && model && (
        <div className="card ai-detail-page__card shadow-sm">
          <div className="ai-detail-page__stripe" />

          <div className="card-body p-4">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
              <div>
                <h2 className="ai-detail-page__title mb-1">{model.name}</h2>
                <span className="ai-detail-page__id-label">ID #{model.id}</span>
              </div>
              <span
                className={`badge fs-6 ${model.isActive ? "bg-success" : "bg-secondary"}`}
              >
                {model.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="ai-detail-page__field">
                  <span className="ai-detail-page__field-label">Version</span>
                  <span className="ai-detail-page__version-badge badge">
                    v{model.version}
                  </span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="ai-detail-page__field">
                  <span className="ai-detail-page__field-label">Creator</span>
                  <span className="ai-detail-page__field-value">
                    {model.creator}
                  </span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="ai-detail-page__field">
                  <span className="ai-detail-page__field-label">Category</span>
                  {currentCategory ? (
                    <span className="ai-detail-page__category-badge badge">
                      {currentCategory.label}
                    </span>
                  ) : (
                    <span className="ai-detail-page__field-value">—</span>
                  )}
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="ai-detail-page__field">
                  <span className="ai-detail-page__field-label">Accuracy</span>
                  <div>
                    <span
                      className={`fw-bold text-${accuracyColor(model.accuracy)}`}
                    >
                      {model.accuracy}%
                    </span>
                    <div className="progress ai-detail-page__progress mt-1">
                      <div
                        className={`progress-bar bg-${accuracyColor(model.accuracy)}`}
                        style={{ width: `${model.accuracy}%` }}
                        role="progressbar"
                        aria-valuenow={model.accuracy}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <span className="ai-detail-page__field-label d-block mb-1">
                Description
              </span>
              <p className="ai-detail-page__description mb-0">
                {model.description}
              </p>
            </div>

            <div className="d-flex gap-2 pt-3 ai-detail-page__divider">
              <button
                className="btn btn-primary"
                onClick={() => setMode("edit")}
              >
                Edit
              </button>
              <button
                className="btn btn-outline-danger ms-auto"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT / CREATE form ── */}
      {(mode === "edit" || mode === "create") && (
        <div className="card ai-detail-page__card shadow-sm">
          <div className="card-body p-4">
            <h2 className="ai-detail-page__title mb-4">
              {isCreate ? "New AI Model" : `Edit — ${model?.name}`}
            </h2>

            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-3">
                {/* Name */}
                <div className="col-12 col-md-6">
                  <label
                    className="form-label fw-semibold ai-detail-page__form-label"
                    htmlFor="name"
                  >
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={`form-control ${cx("name")}`}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. GPT-5"
                  />
                  {fieldErrors.name && (
                    <div className="invalid-feedback">{fieldErrors.name}</div>
                  )}
                </div>

                {/* Version */}
                <div className="col-12 col-md-6">
                  <label
                    className="form-label fw-semibold ai-detail-page__form-label"
                    htmlFor="version"
                  >
                    Version <span className="text-danger">*</span>
                  </label>
                  <input
                    id="version"
                    name="version"
                    type="text"
                    className={`form-control ${cx("version")}`}
                    value={formData.version}
                    onChange={handleChange}
                    placeholder="e.g. 1.0"
                  />
                  {fieldErrors.version && (
                    <div className="invalid-feedback">
                      {fieldErrors.version}
                    </div>
                  )}
                </div>

                {/* Creator */}
                <div className="col-12 col-md-6">
                  <label
                    className="form-label fw-semibold ai-detail-page__form-label"
                    htmlFor="creator"
                  >
                    Creator <span className="text-danger">*</span>
                  </label>
                  <input
                    id="creator"
                    name="creator"
                    type="text"
                    className={`form-control ${cx("creator")}`}
                    value={formData.creator}
                    onChange={handleChange}
                    placeholder="e.g. OpenAI"
                  />
                  {fieldErrors.creator && (
                    <div className="invalid-feedback">
                      {fieldErrors.creator}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="col-12 col-md-6">
                  <label
                    className="form-label fw-semibold ai-detail-page__form-label"
                    htmlFor="categoryId"
                  >
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    className={`form-select ${cx("categoryId")}`}
                    value={formData.categoryId}
                    onChange={handleChange}
                  >
                    <option value={0} disabled>
                      Select a category…
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.categoryId && (
                    <div className="invalid-feedback">
                      {fieldErrors.categoryId}
                    </div>
                  )}
                </div>

                {/* Accuracy */}
                <div className="col-12 col-md-6">
                  <label
                    className="form-label fw-semibold ai-detail-page__form-label"
                    htmlFor="accuracy"
                  >
                    Accuracy (%)
                  </label>
                  <input
                    id="accuracy"
                    name="accuracy"
                    type="number"
                    className={`form-control ${cx("accuracy")}`}
                    min={0}
                    max={100}
                    step={0.1}
                    value={formData.accuracy}
                    onChange={handleChange}
                  />
                  {fieldErrors.accuracy && (
                    <div className="invalid-feedback">
                      {fieldErrors.accuracy}
                    </div>
                  )}
                  <div className="progress mt-2" style={{ height: "6px" }}>
                    <div
                      className={`progress-bar bg-${accuracyColor(formData.accuracy)}`}
                      style={{ width: `${formData.accuracy}%` }}
                    />
                  </div>
                </div>

                {/* isActive */}
                <div className="col-12 col-md-6 d-flex align-items-center">
                  <div className="form-check form-switch mt-3">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label fw-semibold ai-detail-page__form-label"
                      htmlFor="isActive"
                    >
                      Active
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="col-12">
                  <label
                    className="form-label fw-semibold ai-detail-page__form-label"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className={`form-control ${cx("description")}`}
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the model…"
                  />
                  {fieldErrors.description && (
                    <div className="invalid-feedback">
                      {fieldErrors.description}
                    </div>
                  )}
                  <div className="ai-detail-page__char-count">
                    {formData.description.trim().length} / 500
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex gap-2 mt-4 pt-3 ai-detail-page__divider">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Saving…
                    </>
                  ) : isCreate ? (
                    "Create model"
                  ) : (
                    "Save changes"
                  )}
                </button>
                {!isCreate && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline-secondary ms-auto"
                  onClick={() => navigate("/")}
                  disabled={saving}
                >
                  Back to catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiModelDetailPage;
