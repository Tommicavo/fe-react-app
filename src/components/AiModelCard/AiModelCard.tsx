import { useNavigate } from "react-router-dom";
import type { AIModel } from "@/models/aiModel.model";
import type { Category } from "@/models/category.model";
import "./AiModelCard.scss";

interface Props {
  model: AIModel;
  category: Category | undefined;
}

function AiModelCard({ model, category }: Props) {
  const navigate = useNavigate();

  const accuracyColor =
    model.accuracy >= 93
      ? "success"
      : model.accuracy >= 87
        ? "warning"
        : "danger";

  return (
    <div
      className="ai-model-card card h-100 shadow-sm"
      onClick={() => navigate(`/models/${model.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/models/${model.id}`)}
    >
      {/* Category colour stripe */}
      <div
        className="ai-model-card__stripe"
        style={{ backgroundColor: category?.color ?? "#ccc" }}
      />

      <div className="card-body d-flex flex-column gap-3">
        {/* Name */}
        <h5 className="card-title ai-model-card__name mb-0">{model.name}</h5>

        {/* Category pill */}
        {category && (
          <span
            className="ai-model-card__category badge align-self-start"
            style={{
              backgroundColor: category.color + "22",
              color: category.color,
              border: `1px solid ${category.color}55`,
            }}
          >
            {category.label}
          </span>
        )}

        {/* Accuracy bar */}
        <div className="mt-auto">
          <div className="d-flex justify-content-between mb-1">
            <span className="small fw-semibold">Accuracy</span>
            <span className={`small fw-bold text-${accuracyColor}`}>
              {model.accuracy}%
            </span>
          </div>
          <div className="progress ai-model-card__progress">
            <div
              className={`progress-bar bg-${accuracyColor}`}
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
  );
}

export default AiModelCard;
