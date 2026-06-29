import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { aiModelService } from "@/services/aiModel.service";
import type { AIModel } from "@/models/aiModel.model";
import type { AiModelFormData } from "@/services/validators/aiModel.validator";

interface ModelsState {
  list: AIModel[];
  loading: boolean;
  error: string | null;
}

const initialState: ModelsState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchAllModels = createAsyncThunk(
  "models/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await aiModelService.getAllAiModels();
      return data;
    } catch {
      return rejectWithValue("Failed to load models. Is the server running?");
    }
  },
);

export const createModel = createAsyncThunk(
  "models/create",
  async (payload: Omit<AIModel, "id">, { rejectWithValue }) => {
    try {
      const { data } = await aiModelService.insertAiModel(payload);
      return data;
    } catch {
      return rejectWithValue("Failed to create model.");
    }
  },
);

export const updateModel = createAsyncThunk(
  "models/update",
  async (
    { id, payload }: { id: string; payload: AiModelFormData },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await aiModelService.updateAiModel(id, payload);
      return data;
    } catch {
      return rejectWithValue("Failed to update model.");
    }
  },
);

export const deleteModel = createAsyncThunk(
  "models/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await aiModelService.deleteAiModel(id);
      return id;
    } catch {
      return rejectWithValue("Failed to delete model.");
    }
  },
);

const modelsSlice = createSlice({
  name: "models",
  initialState,
  reducers: {
    clearModelsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllModels.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createModel.pending, (state) => {
        state.error = null;
      })
      .addCase(createModel.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(createModel.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(updateModel.fulfilled, (state, action) => {
        const idx = state.list.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateModel.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.list = state.list.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteModel.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearModelsError } = modelsSlice.actions;
export default modelsSlice.reducer;
