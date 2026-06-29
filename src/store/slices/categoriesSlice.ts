import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryService } from "@/services/category.service";
import type { Category } from "@/models/category.model";

interface CategoriesState {
  list: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchAllCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await categoryService.getAllCategories();
      return data;
    } catch {
      return rejectWithValue("Failed to load categories.");
    }
  },
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (payload: Omit<Category, "id">, { rejectWithValue }) => {
    try {
      const { data } = await categoryService.insertCategory(payload);
      return data;
    } catch {
      return rejectWithValue("Failed to create category.");
    }
  },
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async (
    { id, payload }: { id: string; payload: Partial<Category> },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await categoryService.updateCategory(id, payload);
      return data;
    } catch {
      return rejectWithValue("Failed to update category.");
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch {
      return rejectWithValue("Failed to delete category.");
    }
  },
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoriesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createCategory.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoriesError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
