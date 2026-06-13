import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserState = {
  value: {
    email: string | null;
    token: string | null;
    username: string | null;
    movies: any[] | null;
    notifications: any[] | null;
    friendCode: string | null;
    friends: any[] | null;
    columns: number | null;
    sort: string | null;
  };
};

const initialState: UserState = {
  value: { email: null, token: null, username: null, movies: [], friendCode: null, notifications: [], friends: [], columns: null, sort: null }, 
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{email: string, token: string, username: string, movies: any, friendCode: string, friends: any, notifications: any}>) => {
      state.value.email = action.payload.email;
      state.value.token = action.payload.token;
      state.value.username = action.payload.username;
      state.value.movies = action.payload.movies;
      state.value.friendCode = action.payload.friendCode;
      state.value.friends = action.payload.friends;
      state.value.notifications = action.payload.notifications;
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
    setMovieLoaned: (state, action: PayloadAction<any>) => {
      const {index, data} = action.payload;
      if (state.value.movies) {
        state.value.movies[index].pastLoans = data;
        state.value.movies[index].isLoaned = true;
      }
    },
    setMovieReturned: (state, action: PayloadAction<any>) => {
      const {index} = action.payload;
      if (state.value.movies) { 
        state.value.movies[index].isLoaned = false;
      }
    },
    updateNotifications: (state, action: PayloadAction<any>) => {
      state.value.notifications = action.payload;
    },
    logout:(state) => {
      // 🌟 CORRECTION : On remet TOUT à zéro proprement !
      state.value = initialState.value;
    },
    iLikeThisMovie: (state, action: PayloadAction<any>) => {
      const {index} = action.payload;
      if (state.value.movies && state.value.movies[index]) { 
        state.value.movies[index].isLiked = !state.value.movies[index].isLiked;
      }
    },
    removeCollection: (state) => {
      if (state.value.movies) {
        state.value.movies = [];
      }
    },
    addFriend: (state, action: PayloadAction<any>) => {
      if (state.value.friends) {
        state.value.friends = [...state.value.friends, action.payload];
      }
    },
    removeFriend: (state, action: PayloadAction<any>) => {
      if (state.value.friends) {
        state.value.friends = state.value.friends.filter((ami) => ami.username !== action.payload);
      }
    },
    addReviewToStore: (state, action: PayloadAction<{ index: number, review: any }>) => {
      const { index, review } = action.payload;
      // 🌟 CORRECTION : On vérifie que movies et movies[index] existent pour éviter un crash
      if (state.value.movies && state.value.movies[index]) {
        if (!state.value.movies[index].reviews) {
          state.value.movies[index].reviews = [];
        }
        state.value.movies[index].reviews.push(review);
      }
    },
    settingColumns: (state, action: PayloadAction<any>) => {
      state.value.columns = action.payload;
    },
    settingSort: (state, action: PayloadAction<any>) => {
      state.value.sort = action.payload;
    }
}});

export const { login, addMovieToStore, removedMovieFromStore, setMovieLoaned, setMovieReturned, updateNotifications, logout, iLikeThisMovie, removeCollection, removeFriend, addFriend, addReviewToStore, settingColumns, settingSort } = userSlice.actions;
export default userSlice.reducer;
