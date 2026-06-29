import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";
import { categoryService } from "@/services/category.service";
import { aiModelService } from "@/services/aiModel.service";
import { categoryValidator } from "@/services/validators/category.validator";
import type { Category, CategoryFormData } from "@/models/category.model";
import "./AdminPage.scss";

const EMPTY_FORM: CategoryFormData = { label: "" };

function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  // Create
  const [createForm, setCreateForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setGlobalError("");
    try {
      const { data } = await categoryService.getAllCategories();
      setCategories(data);
    } catch {
      setGlobalError("Failed to load categories. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  function handleCreateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCreateForm({ label: e.target.value });
    setCreateError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const { valid, errors } = categoryValidator.validate(
      createForm,
      categories.map((c) => c.label),
    );
    if (!valid) {
      setCreateError(errors.label ?? "Invalid input.");
      return;
    }
    setCreateLoading(true);
    try {
      const { data } = await categoryService.insertCategory({
        label: createForm.label.trim(),
      });
      setCategories((prev) => [...prev, data]);
      setCreateForm(EMPTY_FORM);
    } catch {
      setCreateError("Failed to create category.");
    } finally {
      setCreateLoading(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditForm({ label: cat.label });
    setEditError("");
    setDeletingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setEditError("");
  }

  async function handleEditSave(id: string) {
    const otherLabels = categories
      .filter((c) => c.id !== id)
      .map((c) => c.label);
    const { valid, errors } = categoryValidator.validate(editForm, otherLabels);
    if (!valid) {
      setEditError(errors.label ?? "Invalid input.");
      return;
    }
    setEditLoading(true);
    try {
      const { data } = await categoryService.updateCategory(id, {
        label: editForm.label.trim(),
      });
      setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
      cancelEdit();
    } catch {
      setEditError("Failed to update category.");
    } finally {
      setEditLoading(false);
    }
  }

  async function startDelete(id: string) {
    setEditingId(null);
    setDeleteLoading(true);
    try {
      const { data: models } = await aiModelService.getAllAiModels();
      const inUse = models.some((m) => m.categoryId === id);
      if (inUse) {
        setGlobalError(
          "This category is assigned to one or more AI models and cannot be deleted.",
        );
        return;
      }
      setDeletingId(id);
    } catch {
      setGlobalError("Failed to check category usage.");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function confirmDelete(id: string) {
    setDeleteLoading(true);
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeletingId(null);
    } catch {
      setGlobalError("Failed to delete category.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Admin Panel</h1>
        <p className="admin-page__subtitle">Manage application categories</p>
      </div>

      <section className="admin-section">
        <div className="admin-section__head">
          <Tag size={18} />
          <h2 className="admin-section__title">Categories</h2>
          <span className="admin-section__badge">{categories.length}</span>
        </div>

        {/* Create form */}
        <form className="admin-create-form" onSubmit={handleCreate} noValidate>
          <div className="admin-create-form__field">
            <input
              type="text"
              className={`form-control${createError ? " is-invalid" : ""}`}
              placeholder="New category name…"
              value={createForm.label}
              onChange={handleCreateChange}
              disabled={createLoading}
              maxLength={60}
            />
            {createError && (
              <div className="invalid-feedback d-block">{createError}</div>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary admin-create-form__btn"
            disabled={createLoading}
          >
            {createLoading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <Plus size={16} />
            )}
            Add
          </button>
        </form>

        {/* Global error */}
        {globalError && (
          <div className="admin-alert admin-alert--danger">
            {globalError}
            <button
              className="admin-alert__close"
              onClick={() => setGlobalError("")}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="admin-loading">
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />
            Loading…
          </div>
        ) : categories.length === 0 ? (
          <p className="admin-empty">No categories yet. Add one above.</p>
        ) : (
          <ul className="admin-list">
            {categories.map((cat) => (
              <li key={cat.id} className="admin-list__item">
                {editingId === cat.id ? (
                  // Edit row
                  <div className="admin-list__edit">
                    <div className="admin-list__edit-field">
                      <input
                        type="text"
                        className={`form-control form-control-sm${editError ? " is-invalid" : ""}`}
                        value={editForm.label}
                        onChange={(e) => {
                          setEditForm({ label: e.target.value });
                          setEditError("");
                        }}
                        disabled={editLoading}
                        maxLength={60}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Escape") cancelEdit();
                          if (e.key === "Enter") handleEditSave(cat.id);
                        }}
                      />
                      {editError && (
                        <div className="invalid-feedback d-block">
                          {editError}
                        </div>
                      )}
                    </div>
                    <div className="admin-list__edit-actions">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleEditSave(cat.id)}
                        disabled={editLoading}
                        title="Save"
                      >
                        {editLoading ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          <Check size={14} />
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={cancelEdit}
                        disabled={editLoading}
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : deletingId === cat.id ? (
                  // Delete confirm row
                  <div className="admin-list__confirm">
                    <span className="admin-list__confirm-text">
                      Delete <strong>{cat.label}</strong>?
                    </span>
                    <div className="admin-list__confirm-actions">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => confirmDelete(cat.id)}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          "Delete"
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setDeletingId(null)}
                        disabled={deleteLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Normal row
                  <>
                    <span className="admin-list__label">{cat.label}</span>
                    <div className="admin-list__actions">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => startEdit(cat)}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => startDelete(cat.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AdminPage;
