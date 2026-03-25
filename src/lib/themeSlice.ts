import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
}

export interface ThemeState {
  colors: ThemeColors;
  logoUrl?: string;
  isPreviewMode: boolean;
  hasUnsavedChanges: boolean;
}

const initialState: ThemeState = {
  colors: {
    primaryColor: '#000000',
    secondaryColor: '#666666',
  },
  logoUrl: undefined,
  isPreviewMode: false,
  hasUnsavedChanges: false,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.colors.primaryColor = action.payload;
      state.hasUnsavedChanges = true;
    },
    setSecondaryColor: (state, action: PayloadAction<string>) => {
      state.colors.secondaryColor = action.payload;
      state.hasUnsavedChanges = true;
    },
    setLogoUrl: (state, action: PayloadAction<string | undefined>) => {
      state.logoUrl = action.payload;
      state.hasUnsavedChanges = true;
    },
    setColors: (state, action: PayloadAction<ThemeColors>) => {
      state.colors = { ...state.colors, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    setPreviewMode: (state, action: PayloadAction<boolean>) => {
      state.isPreviewMode = action.payload;
    },
    loadTheme: (state, action: PayloadAction<{ colors: ThemeColors; logoUrl?: string }>) => {
      state.colors = action.payload.colors;
      state.logoUrl = action.payload.logoUrl;
      state.hasUnsavedChanges = false;
    },
    markAsSaved: (state) => {
      state.hasUnsavedChanges = false;
    },
    resetTheme: (state) => {
      state.colors = initialState.colors;
      state.logoUrl = undefined;
      state.hasUnsavedChanges = true;
    },
  },
});

export const {
  setPrimaryColor,
  setSecondaryColor,
  setLogoUrl,
  setColors,
  setPreviewMode,
  loadTheme,
  markAsSaved,
  resetTheme,
} = themeSlice.actions;

export default themeSlice.reducer;