import userReducer, { logout } from './user';

describe('User Reducer', () => {
  
  it('doit vider le token et les données utilisateur lors de la deconnexion (logout)', () => {
    
   
    const loggedInState = {
      value: {
        _id: 1,
        email: 'test@test.com',
        token: 'super-token-secret-123',
        username: 'Bryce',
        movies: [{ tmdb_id: 550, title_fr: 'Fight Club' }],
        notifications: [{ message: 'Nouveau message' }],
        friendCode: 'ABCD',
        friends: [{ username: 'Alice' }],
        columns: 2,
        sort: 'title_asc'
      }
    };

    const action = logout();
    const newState = userReducer(loggedInState, action);


    expect(newState.value.token).toBeNull();
    expect(newState.value.username).toBeNull();
    expect(newState.value.email).toBeNull();
    
    expect(newState.value.movies).toEqual([]);
    expect(newState.value.notifications).toEqual([]);
    expect(newState.value.friends).toEqual([]);
  });

});