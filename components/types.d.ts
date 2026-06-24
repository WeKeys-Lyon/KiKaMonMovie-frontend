export type Reply = {
    _id: string,
    userid: { _id: string, username: string, avatar: string };
    text: string;
    createdAt: Date;
}
export type Review = {
  _id: string;
  userid: { _id: string, username: string };
  rating?: number;
  comment?: string;
  likes?: string[];
  replies?: Reply[];
  createdAt: Date;
};

export type PastLoans = {
    Notification: boolean, 
    _id: string, 
    borrower?: string, 
    dueDate: Date, 
    isSharedToUser: boolean, 
    movieid: string, 
    notes?: string, 
    userid?: { _id: string, username: string };
};

export type movieProps = {
        tmdb_id: number,
        title_fr: string,
        userid: string,
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
        reviews?: Review[],
        popularity?: number
    };

export type Friends = {
    _id: string, 
    username: string 
};
export type notificationsProps = {
    _id: string,
    type: 'friend_request' | 'friend_accepted' | 'friend_refused' | 'loan_request' | 'loan_reminder' | 'loan_accepted' | 'loan_refused' | 'loan_expired' | 'loan_returned' | 'review_posted',
    senderId?: { _id: string, username: string, friendCode: string },
    movieId?: {_id: string, original_title: string, title_fr: string, poster_path: string, tmdb_id: number},
    isRead: boolean, 
    createdAt: Date
};

export type User = {
    _id: string,
    username: string,
    password: string,
    email: string,
    token: string,
    pushToken?: string,
    friendCode: string,
    friends?: Friends[],
    pendingRequests: number[],
    movies: movieProps[],
    notifications: Notifications[],
    sort?: string,
    columns?: number,
    avatar: string
}