export default type movieProps = {
        tmdb_id: Number,
        title_fr: String,
        userid: Number,
        original_title: String,
        release_date?: String,
        poster_path?: String,
        DirectedBy?: [{name: String, popularity?: Number}],
        Cast?: [{name: String, popularity?: Number}],
        MusicBy?: [{name: String, popularity?: Number}],
        Genres?: [{name: String}],
        isLoaned: Boolean,
        isLiked: Boolean,
        isAsked?: [Number],
        pastLoans?: [{Notification: Boolean, _id: Number, borrower?: String, dueDate?: Date, isSharedToUser: Boolean, movieid: Number, notes?: String, userid?: Number}],
        reviews?: [{userid: Number, rating?: Number, comment?: String, likes?: [Number], replies?: [{userid: Number, text: String, createdAt: Date}], createdAt: Date }]
    }
}