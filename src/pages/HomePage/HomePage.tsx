import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDown01,
  ArrowUp01,
  PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllModels } from "@/store/slices/modelsSlice";
import { fetchAllCategories } from "@/store/slices/categoriesSlice";
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

const PAGE_SIZE = 8;

function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const models = useAppSelector((state) => state.models.list);
  const modelsLoading = useAppSelector((state) => state.models.loading);
  const modelsError = useAppSelector((state) => state.models.error);
  const categories = useAppSelector((state) => state.categories.list);

  useEffect(() => {
    if (models.length === 0) dispatch(fetchAllModels());
    if (categories.length === 0) dispatch(fetchAllCategories());
  }, [dispatch, models.length, categories.length]);

  const [nameFilter, setNameFilter] = useState("");
  const [accuracyMin, setAccuracyMin] = useState<number | "">("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [nameSort, setNameSort] = useState<SortDir>(null);
  const [accuracySort, setAccuracySort] = useState<SortDir>(null);
  const [creatorSort, setCreatorSort] = useState<SortDir>(null);
  const [categorySort, setCategorySort] = useState<SortDir>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [String(c.id), c])),
    [categories],
  );

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  const hasActiveFilters =
    nameFilter ||
    accuracyMin !== "" ||
    creatorFilter ||
    selectedCategoryIds.length > 0;

  const filteredModels = useMemo(() => {
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
      list = list.filter((m) => selectedCategoryIds.includes(m.categoryId));

    if (nameSort)
      list.sort((a, b) =>
        nameSort === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      );
    else if (accuracySort)
      list.sort((a, b) =>
        accuracySort === "asc"
          ? a.accuracy - b.accuracy
          : b.accuracy - a.accuracy,
      );
    else if (creatorSort)
      list.sort((a, b) =>
        creatorSort === "asc"
          ? a.creator.localeCompare(b.creator)
          : b.creator.localeCompare(a.creator),
      );
    else if (categorySort)
      list.sort((a, b) =>
        categorySort === "asc"
          ? a.categoryId.localeCompare(b.categoryId)
          : b.categoryId.localeCompare(a.categoryId),
      );

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

  const totalPages = Math.max(1, Math.ceil(filteredModels.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedModels = filteredModels.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const goToPage = (page: number) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  return (
    <div className="home-page container-fluid py-3 px-3 px-md-4">
      {/* ── Page header ── */}
      <div className="home-page__header d-flex align-items-center justify-content-between mb-4">
        <h1 className="home-page__title mb-0">AI Models Catalogue</h1>
        <button
          className="home-page__new-btn btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={() => navigate("/models/new")}
        >
          <PlusCircle size={18} />
          <span>New Model</span>
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="home-page__filters card p-3 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="fw-semibold small text-uppercase home-page__filter-label">
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
                onToggle={() => {
                  setNameSort(nextDir(nameSort));
                  setCurrentPage(1);
                }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search by name…"
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Accuracy */}
          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label small mb-1">Min accuracy (%)</label>
            <div className="input-group input-group-sm">
              <SortBtn
                dir={accuracySort}
                onToggle={() => {
                  setAccuracySort(nextDir(accuracySort));
                  setCurrentPage(1);
                }}
                numeric
              />
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 90"
                min={0}
                max={100}
                value={accuracyMin}
                onChange={(e) => {
                  setAccuracyMin(
                    e.target.value === "" ? "" : Number(e.target.value),
                  );
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Creator */}
          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label small mb-1">Creator</label>
            <div className="input-group input-group-sm">
              <SortBtn
                dir={creatorSort}
                onToggle={() => {
                  setCreatorSort(nextDir(creatorSort));
                  setCurrentPage(1);
                }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search by creator…"
                value={creatorFilter}
                onChange={(e) => {
                  setCreatorFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Category dropdown */}
          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label small mb-1">Category</label>
            <div className="input-group input-group-sm">
              <SortBtn
                dir={categorySort}
                onToggle={() => {
                  setCategorySort(nextDir(categorySort));
                  setCurrentPage(1);
                }}
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
                              String(cat.id),
                            )}
                            onChange={() => toggleCategory(String(cat.id))}
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
      {!modelsLoading && !modelsError && (
        <p className="home-page__count small mb-3">
          Showing <strong>{pagedModels.length}</strong> of{" "}
          <strong>{filteredModels.length}</strong> models
          {filteredModels.length !== models.length && (
            <>
              {" "}
              (filtered from <strong>{models.length}</strong> total)
            </>
          )}
        </p>
      )}

      {modelsLoading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {modelsError && (
        <div className="alert alert-danger" role="alert">
          {modelsError}
        </div>
      )}

      {!modelsLoading && !modelsError && filteredModels.length === 0 && (
        <div className="alert alert-warning" role="alert">
          No models match your current filters.
        </div>
      )}

      {/* ── Cards Grid ── */}
      {!modelsLoading && !modelsError && (
        <div className="row g-3">
          {pagedModels.map((model) => (
            <div key={model.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <AiModelCard
                model={model}
                category={categoryMap.get(model.categoryId)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!modelsLoading && !modelsError && totalPages > 1 && (
        <nav
          className="d-flex justify-content-center align-items-center gap-2 mt-4"
          aria-label="Models pagination"
        >
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => goToPage(1)}
            disabled={safePage === 1}
          >
            «
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1,
            )
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((item, i) =>
              item === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-muted">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  className={`btn btn-sm ${safePage === item ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => goToPage(item as number)}
                >
                  {item}
                </button>
              ),
            )}

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
          >
            ›
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => goToPage(totalPages)}
            disabled={safePage === totalPages}
          >
            »
          </button>
        </nav>
      )}
    </div>
  );
}

export default HomePage;
