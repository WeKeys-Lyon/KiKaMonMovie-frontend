export type Review = {
  _id: number;
  userid: { _id: number, username: string } | number;
  rating?: number;
  comment?: string;
  likes?: number[];
  replies?: {
    userid: number;
    text: string;
    createdAt: Date;
  }[];
  createdAt: Date;
};

export type PastLoans = {
    Notification: boolean, 
    _id: number, 
    borrower?: string, 
    dueDate?: Date, 
    isSharedToUser: boolean, 
    movieid: number, 
    notes?: string, 
    userid?: number
};

export type movieProps = {
        tmdb_id: number,
        title_fr: string,
        userid: number,
        original_title: string,
        release_date?: string,
        poster_path?: string,
        DirectedBy?: {name: string, popularity?: number}[],
        Cast?: {name: string, popularity?: number}[],
        MusicBy?: {name: string, popularity?: number}[],
        Genres?: {name: string}[],
        isLoaned: boolean,
        isLiked: boolean,
        isAsked?: number[],
        pastLoans?: PastLoans[],
        reviews?: Review[]
    };

export type Friends = {
    userid: {_id: number, username: string}, 
    canSeeMyCollection: boolean, 
    canAskForMovies: boolean,
    canRate: boolean,
    canComment: boolean
};
export type Notifications = {
    type: 'friend_request' | 'friend_accepted' | 'friend_refused' | 'loan_request' | 'loan_reminder' | 'loan_accepted' | 'loan_refused' | 'loan_expired' | 'loan_returned' | 'review_posted',
    senderId?: number,
    movieId?: number,
    isRead: boolean, 
    createdAt: Date
};

export type User = {
    _id: number,
    username: string,
    password: string,
    email: string,
    token: string,
    pushToken?: string,
    friendCode: string,
    friends?: Friends[],
    pendingRequests: number[],
    movies: movieProps[],
    notifications: Notifications[]
}