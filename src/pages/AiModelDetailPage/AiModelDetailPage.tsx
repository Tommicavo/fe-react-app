import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { aiModelService } from "@/services/aiModel.service";
import { categoryService } from "@/services/category.service";
import type { AIModel } from "@/models/aiModel.model";
import type { Category } from "@/models/category.model";
import "./AiModelDetailPage.scss";

type Mode = "view" | "edit" | "create";

const EMPTY_MODEL: Omit<AIModel, "id"> = {
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
  const [formData, setFormData] = useState<Omit<AIModel, "id">>(EMPTY_MODEL);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      .catch(() => setError("Failed to load model data."))
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
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "accuracy" || name === "categoryId"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
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
      setError("Failed to save. Please try again.");
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
      setError("Failed to delete model.");
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
    setMode("view");
    setError(null);
  };

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
      {/* ── Back button ── */}
      <button
        className="btn btn-sm btn-outline-secondary mb-4 d-inline-flex align-items-center gap-1"
        onClick={() => navigate("/")}
      >
        ← Back to catalogue
      </button>

      {/* ── Alerts ── */}
      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
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
          {/* Colour stripe */}
          <div
            className="ai-detail-page__stripe"
            style={{ backgroundColor: currentCategory?.color ?? "#ccc" }}
          />

          <div className="card-body p-4">
            {/* Header row */}
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
              <div>
                <h2 className="ai-detail-page__title mb-1">{model.name}</h2>
                <span className="text-muted small">ID #{model.id}</span>
              </div>
              <div className="d-flex gap-2">
                <span
                  className={`badge fs-6 ${model.isActive ? "bg-success" : "bg-secondary"}`}
                >
                  {model.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Detail grid */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="ai-detail-page__field">
                  <span className="ai-detail-page__field-label">Version</span>
                  <span className="badge bg-primary bg-opacity-10 text-primary fs-6">
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
                    <span
                      className="badge"
                      style={{
                        backgroundColor: currentCategory.color + "22",
                        color: currentCategory.color,
                        border: `1px solid ${currentCategory.color}55`,
                      }}
                    >
                      {currentCategory.label}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
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

            {/* Description */}
            <div className="mb-4">
              <span className="ai-detail-page__field-label d-block mb-1">
                Description
              </span>
              <p className="ai-detail-page__description mb-0">
                {model.description}
              </p>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 pt-3 border-top">
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
                  <label className="form-label fw-semibold" htmlFor="name">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. GPT-5"
                  />
                </div>

                {/* Version */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold" htmlFor="version">
                    Version <span className="text-danger">*</span>
                  </label>
                  <input
                    id="version"
                    name="version"
                    type="text"
                    className="form-control"
                    value={formData.version}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 1.0"
                  />
                </div>

                {/* Creator */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold" htmlFor="creator">
                    Creator <span className="text-danger">*</span>
                  </label>
                  <input
                    id="creator"
                    name="creator"
                    type="text"
                    className="form-control"
                    value={formData.creator}
                    onChange={handleChange}
                    required
                    placeholder="e.g. OpenAI"
                  />
                </div>

                {/* Category */}
                <div className="col-12 col-md-6">
                  <label
                    className="form-label fw-semibold"
                    htmlFor="categoryId"
                  >
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    className="form-select"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
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
                </div>

                {/* Accuracy */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold" htmlFor="accuracy">
                    Accuracy (%)
                  </label>
                  <input
                    id="accuracy"
                    name="accuracy"
                    type="number"
                    className="form-control"
                    min={0}
                    max={100}
                    step={0.1}
                    value={formData.accuracy}
                    onChange={handleChange}
                  />
                  {/* Live preview */}
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
                      className="form-check-label fw-semibold"
                      htmlFor="isActive"
                    >
                      Active
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="col-12">
                  <label
                    className="form-label fw-semibold"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the model…"
                  />
                </div>
              </div>

              {/* Form actions */}
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
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
