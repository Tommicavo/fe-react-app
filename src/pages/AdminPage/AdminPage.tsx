import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/store/slices/categoriesSlice";
import { categoryValidator } from "@/services/validators/category.validator";
import type { CategoryFormData } from "@/models/category.model";
import "./AdminPage.scss";

const EMPTY_FORM: CategoryFormData = { label: "" };

function AdminPage() {
  const dispatch = useAppDispatch();

  const categories = useAppSelector((state) => state.categories.list);
  const loading = useAppSelector((state) => state.categories.loading);
  const globalError = useAppSelector((state) => state.categories.error);

  const [createForm, setCreateForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchAllCategories());
  }, [dispatch, categories.length]);

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
      await dispatch(
        createCategory({ label: createForm.label.trim() }),
      ).unwrap();
      setCreateForm(EMPTY_FORM);
    } catch {
      setCreateError("Failed to create category.");
    } finally {
      setCreateLoading(false);
    }
  }

  function startEdit(cat: { id: string; label: string }) {
    setEditingId(cat.id);
    setEditForm({ label: cat.label });
    setEditError("");
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
      await dispatch(
        updateCategory({ id, payload: { label: editForm.label.trim() } }),
      ).unwrap();
      cancelEdit();
    } catch {
      setEditError("Failed to update category.");
    } finally {
      setEditLoading(false);
    }
  }

  function startDelete(id: string) {
    setDeletingId(id);
  }

  async function confirmDelete(id: string) {
    setDeleteLoading(true);
    try {
      await dispatch(deleteCategory(id)).unwrap();
      setDeletingId(null);
    } catch {
      // error in Redux state
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

        {/* Global error from Redux */}
        {globalError && (
          <div className="admin-alert admin-alert--danger">{globalError}</div>
        )}

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
