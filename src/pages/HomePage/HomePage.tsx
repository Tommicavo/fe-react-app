import { useEffect, useMemo, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, ArrowDown01, ArrowUp01 } from "lucide-react";
import { aiModelService } from "@/services/aiModel.service";
import { categoryService } from "@/services/category.service";
import type { AIModel } from "@/models/aiModel.model";
import type { Category } from "@/models/category.model";
import AiModelCard from "@/components/AiModelCard/AiModelCard";
import "./HomePage.scss";

type SortDir = "asc" | "desc" | null;

function nextDir(current: SortDir): SortDir {
  if (current === null) return "asc";
  if (current === "asc") return "desc";
  return null;
}

function SortBtn({
  dir,
  onToggle,
  numeric = false,
}: {
  dir: SortDir;
  onToggle: () => void;
  numeric?: boolean;
}) {
  const AscIcon = numeric ? ArrowDown01 : ArrowDownAZ;
  const DescIcon = numeric ? ArrowUp01 : ArrowUpAZ;

  return (
    <button
      className={`btn btn-sm ${dir ? "btn-primary" : "btn-outline-secondary"}`}
      onClick={onToggle}
      title={
        dir === "asc" ? "Sorted A→Z" : dir === "desc" ? "Sorted Z→A" : "Sort"
      }
    >
      {dir === "desc" ? <DescIcon size={16} /> : <AscIcon size={16} />}
    </button>
  );
}

function HomePage() {
  // Data
  const [models, setModels] = useState<AIModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [accuracyMin, setAccuracyMin] = useState<number | "">("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sort
  const [nameSort, setNameSort] = useState<SortDir>(null);
  const [accuracySort, setAccuracySort] = useState<SortDir>(null);
  const [creatorSort, setCreatorSort] = useState<SortDir>(null);
  const [categorySort, setCategorySort] = useState<SortDir>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelsResponse, categoriesResponse] = await Promise.all([
          aiModelService.getAllAiModels(),
          categoryService.getAllCategories(),
        ]);
        setModels(modelsResponse.data);
        setCategories(categoriesResponse.data);
      } catch {
        setError("Failed to load data. Make sure the JSON server is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [Number(c.id), c])),
    [categories],
  );

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const clearFilters = () => {
    setNameFilter("");
    setAccuracyMin("");
    setCreatorFilter("");
    setSelectedCategoryIds([]);
    setNameSort(null);
    setAccuracySort(null);
    setCreatorSort(null);
    setCategorySort(null);
  };

  const hasActiveFilters =
    nameFilter ||
    accuracyMin !== "" ||
    creatorFilter ||
    selectedCategoryIds.length > 0;

  const displayedModels = useMemo(() => {
    let list = [...models];

    if (nameFilter.trim())
      list = list.filter((m) =>
        m.name.toLowerCase().includes(nameFilter.toLowerCase().trim()),
      );

    if (accuracyMin !== "")
      list = list.filter((m) => m.accuracy >= Number(accuracyMin));

    if (creatorFilter.trim())
      list = list.filter((m) =>
        m.creator.toLowerCase().includes(creatorFilter.toLowerCase().trim()),
      );

    if (selectedCategoryIds.length > 0)
      list = list.filter((m) =>
        selectedCategoryIds.includes(Number(m.categoryId)),
      );

    if (nameSort) {
      list.sort((a, b) =>
        nameSort === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      );
    } else if (accuracySort) {
      list.sort((a, b) =>
        accuracySort === "asc"
          ? a.accuracy - b.accuracy
          : b.accuracy - a.accuracy,
      );
    } else if (creatorSort) {
      list.sort((a, b) =>
        creatorSort === "asc"
          ? a.creator.localeCompare(b.creator)
          : b.creator.localeCompare(a.creator),
      );
    } else if (categorySort) {
      list.sort((a, b) =>
        categorySort === "asc"
          ? Number(a.categoryId) - Number(b.categoryId)
          : Number(b.categoryId) - Number(a.categoryId),
      );
    }

    return list;
  }, [
    models,
    nameFilter,
    accuracyMin,
    creatorFilter,
    selectedCategoryIds,
    nameSort,
    accuracySort,
    creatorSort,
    categorySort,
  ]);

  return (
    <div className="home-page container-fluid py-3 px-3 px-md-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="home-page__title mb-0">AI Models Catalogue</h1>
      </div>

      {/* ── Filters ── */}
      <div className="home-page__filters card p-3 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="fw-semibold small text-muted text-uppercase">
            Filter &amp; Sort
          </span>
          {hasActiveFilters && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={clearFilters}
            >
              Clear all
            </button>
          )}
        </div>

        <div className="row g-2">
          {/* Name */}
          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label small mb-1">Name</label>
            <div className="input-group input-group-sm">
              <SortBtn
                dir={nameSort}
                onToggle={() => setNameSort(nextDir(nameSort))}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search by name…"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Accuracy */}
          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label small mb-1">Min accuracy (%)</label>
            <div className="input-group input-group-sm">
              <SortBtn
                dir={accuracySort}
                onToggle={() => setAccuracySort(nextDir(accuracySort))}
                numeric
              />
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 90"
                min={0}
                max={100}
                value={accuracyMin}
                onChange={(e) =>
                  setAccuracyMin(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
            </div>
          </div>

          {/* Creator */}
          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label small mb-1">Creator</label>
            <div className="input-group input-group-sm">
              <SortBtn
                dir={creatorSort}
                onToggle={() => setCreatorSort(nextDir(creatorSort))}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search by creator…"
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Category dropdown */}
          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label small mb-1">Category</label>
            <div className="input-group input-group-sm">
              <SortBtn
                dir={categorySort}
                onToggle={() => setCategorySort(nextDir(categorySort))}
                numeric
              />
              <div className="home-page__category-dropdown flex-grow-1 position-relative">
                <button
                  className="btn btn-sm btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
                  onClick={() => setDropdownOpen((o) => !o)}
                >
                  <span>
                    {selectedCategoryIds.length === 0
                      ? "All categories"
                      : `${selectedCategoryIds.length} selected`}
                  </span>
                  <span className="ms-1">▾</span>
                </button>

                {dropdownOpen && (
                  <ul className="home-page__category-menu dropdown-menu show">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <label className="dropdown-item d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={selectedCategoryIds.includes(
                              Number(cat.id),
                            )}
                            onChange={() => toggleCategory(Number(cat.id))}
                          />
                          <span
                            className="home-page__category-dot"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      {!loading && !error && (
        <p className="text-muted small mb-3">
          Showing <strong>{displayedModels.length}</strong> of{" "}
          <strong>{models.length}</strong> models
        </p>
      )}

      {/* ── States ── */}
      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && displayedModels.length === 0 && (
        <div className="alert alert-warning" role="alert">
          No models match your current filters.
        </div>
      )}

      {/* ── AIModel Cards Grid ── */}
      {!loading && !error && (
        <div className="row g-3">
          {displayedModels.map((model) => (
            <div key={model.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <AiModelCard
                model={model}
                category={categoryMap.get(Number(model.categoryId))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
