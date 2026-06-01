import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserState = {
  value: {
    email: string | null;
    token: string | null;
    username: string | null;
    movies: any[] | null;
    /* linkingCode: string | null; */
  };
};

const initialState: UserState = {
  value: { email: null, token: null, username: null, movies: [] /* linkingCode: null */ },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /* updateEmail: (state, action: PayloadAction<string>) => {
      state.value.email = action.payload;
    }, */
    login: (state, action: PayloadAction<{email: string, token: string, username: string, movies: any /*linkingCode: string*/}>) => {
      state.value.email = action.payload.email;
      state.value.token = action.payload.token;
      state.value.username = action.payload.username;
      state.value.movies = action.payload.movies;
      /* state.value.linkingCode = action.payload.linkingCode; */
    },
    addMovieToStore: (state, action: PayloadAction<any>) => {
      state.value.movies?.push(action.payload);
    },
    removedMovieFromStore: (state, action: PayloadAction<any>) => {
      if (state.value.movies) {
      state.value.movies = state.value.movies.filter(
          (movie: any) => String(movie.tmdb_id) !== String(action.payload)
        );
      }
    },

  },
});

export const { login, addMovieToStore, removedMovieFromStore } = userSlice.actions;
export default userSlice.reducer;
