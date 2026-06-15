import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Modal, Alert, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Buttons } from '../components/buttons';
import { addMovieToStore, addReviewToStore, updateMovieInStore } from '../reducers/user';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import Poster from '../components/poster';
import LoanModal from './loanModal';
import LoanDetailsModal from './loanDetailsModale';
import StarRating from '../components/starRating';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import { iLikeThisMovie } from '../reducers/user';

type MovieCardScreenProps = {
  navigation: NavigationProp<ParamListBase>,
  clickable: boolean,
  moviedata: any,
  setIsModalVisible: any,
  drawStyle: boolean
  mode?: 'add' | 'collection' | 'friend' | 'manage_request';
  requester?: any;
  notificationId?: string;
  onFilterClick?: (type: string, value: string) => void;
  onDeleteClick?: () => void;
  onAddSuccess?: () => void;
  onAskMovie?: () => void;
  ownerId?: string;
  initialTab?: string;
};

export default function MovieCard({ navigation, clickable, moviedata, setIsModalVisible, drawStyle, mode = 'add', onFilterClick, onDeleteClick, onAddSuccess, onAskMovie, requester, notificationId, ownerId, initialTab }: MovieCardScreenProps) {

  const BACKEND_URL = process.env.BACKEND_URL;

  const user = useSelector((state: any) => state.user.value);
  const dispatch = useDispatch();
  const setModalVisible = () => {
    setIsModalVisible(false)
  }
  const [datas, setDatas] = useState(moviedata)
  const [isLoanModalVisible, setIsLoanModalVisible] = useState(false);
  const [isLoanDetailsVisible, setIsLoanDetailsVisible] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean>(moviedata.isLiked);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  useEffect(() => {
    if (initialTab === 'reviews' || initialTab === 'details') {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (mode === 'collection' && datas) {
      dispatch(updateMovieInStore(datas));
    }
  }, [datas]);

  //silent refresh
  useEffect(() => {
    if (activeTab === 'reviews') {
      const fetchFreshReviews = async () => {
        
        try {
          let freshMovies = [];
          if (mode === 'collection') {
            const response = await fetch(`${process.env.BACKEND_URL}/users/collection/${user.token}`);
            const data = await response.json();
            if (data.result) freshMovies = data.movies;
          } else if (mode === 'friend' && ownerId) {
            const response = await fetch(`${process.env.BACKEND_URL}/users/friend-collection`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: user.token, friendId: ownerId })
            });
            const data = await response.json();
            if (data.result) freshMovies = data.movies;
          }
          const freshMovie = freshMovies.find((m: any) => m.tmdb_id === datas.tmdb_id);

          if (freshMovie && freshMovie.reviews) {
            // On met à jour silencieusement les données du composant (sans fermer la modale !)
            setDatas((prevDatas: any) => ({
              ...prevDatas,
              reviews: freshMovie.reviews
            }));
          }

        } catch (error) {
          console.error("Erreur lors du silent refresh :", error);
        }
      };

      fetchFreshReviews();
    }
  }, [activeTab]);

  
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');

  // 🌟 NOUVEAUX ÉTATS POUR LES RÉPONSES
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  //etats pour la modification de reviews
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  //modifier ou supprimer les réponses aux reviews
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState('');

  const currentLoan = datas?.pastLoans && datas.pastLoans.length > 0
    ? datas.pastLoans[datas.pastLoans.length - 1]
    : null;

  const didIMakeAReview = () => {
    
    if (moviedata.reviews) {
      let myReview = null;
      if (mode == 'collection') {
        myReview = user.movies.find((film) => film.tmdb_id == moviedata.tmdb_id).reviews.find((avis: any) => avis.userid == user._id);
      } else {
         myReview = moviedata.reviews.find((avis: any) => avis.userid == user._id);
      }
      if (myReview) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  };

  useEffect(() => {
    const init = async () => {
      if (drawStyle) {
        const myURL = `${BACKEND_URL}/movies/searchid/${moviedata.tmdb_id}`
        const response = await fetch(encodeURI(myURL));
        const data = await response.json();
        if (data.result) {
          // On garde la fusion pour ne pas perdre nos reviews
          setDatas(prevDatas => ({ ...prevDatas, ...data.answer }));
        }
      }
    }
    init()
  }, [])

  const handleAddMovie = async () => {
    const BACKEND_URL = process.env.BACKEND_URL;
    try {
      const response = await fetch(`${BACKEND_URL}/users/add-movie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: user.token,
          movie: datas,
        }),
      });

      const data = await response.json();

      if (data.result) {
        setIsModalVisible(false);
        datas.isLoaned = false;
        datas.isLiked = false;
        dispatch(addMovieToStore(datas));
        if (onAddSuccess) onAddSuccess();
        navigation.navigate('TabNavigator', { screen: 'Ma Collection' });
      } else {
        console.log("Erreur lors de l'ajout", data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderClickableNames = (items: any[], type: string, maxItems?: number) => {
    if (!items || items.length === 0) return <Text style={styles.modalText}>Inconnu</Text>;
    const displayedItems = maxItems ? items.slice(0, maxItems) : items;
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {displayedItems.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            disabled={mode === 'add'}
            onPress={() => onFilterClick && onFilterClick(type, item.name)}
          >
            <Text style={[styles.modalText, { fontSize: 16, lineHeight: 24 }, mode === 'collection' && { color: '#e8be4b', textDecorationLine: 'underline' }]}>
              {item.name}{index < displayedItems.length - 1 ? ', ' : ''}
            </Text>
          </TouchableOpacity>
        ))}
        {maxItems && items.length > maxItems && (
          <Text style={[styles.modalText, { color: '#aaa', fontStyle: 'italic', fontSize: 16 }]}>
            {` (+ ${items.length - maxItems} autres)`}
          </Text>
        )}
      </View>
    );
  };

  let imageUrl: string | boolean = '';
  if (mode == 'add') {
    datas.poster_path ? imageUrl = `https://image.tmdb.org/t/p/w500${datas.poster_path}` : imageUrl = false;
  } else {
    datas.poster_path ? imageUrl = `https://res.cloudinary.com/dj5fkdyn8/image/upload/v1781111174${datas.poster_path}` : imageUrl = false;
  }

  const onLendClick = () => {
    setIsLoanModalVisible(true);
  };
  const indexMovie = user.movies.findIndex((film: any) => moviedata.tmdb_id == film.tmdb_id);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    const myURL = `${BACKEND_URL}/users/isLiked`;
    const response = await fetch(encodeURI(myURL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: user.token,
        tmdb_id: moviedata.tmdb_id
      }),
    });
    const data = await response.json();
    dispatch(iLikeThisMovie({ index: indexMovie }))
  }

  const drawHeart = () => {
    if (mode == 'add') {
      return (<></>)
    } else {
      return ((isLiked) ? <FontAwesome name="heart" size={20} color='#ff0000' style={styles.icon} /> : <FontAwesome name="heart" size={20} color='#bebebe' style={styles.icon} />)
    }
  }

  const handleRefuse = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/users/refuse-loan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: user.token,
          tmdb_id: moviedata.tmdb_id,
          notificationId: notificationId,
          requesterId: requester._id
        })
      });
      const data = await response.json();

      if (data.result) {
        Alert.alert("Refusé", "La demande a été refusée.");
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error("Erreur lors du refus :", error);
    }
  };

  const handlePublishReview = async () => {
    if (rating === 0 && reviewText.trim() === '') {
      Alert.alert("Oups", "Veuillez laisser une note ou un commentaire.");
      return;
    }

    try {
      // 🌟 DÉTECTION : Mode Création ou Mode Édition ?
      const url = isEditing ? `${BACKEND_URL}/users/edit-review` : `${BACKEND_URL}/users/add-review`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: user.token,
          ownerId: ownerId || user._id, 
          tmdb_id: datas.tmdb_id,
          // Variables spécifiques à l'édition :
          reviewId: editingReviewId, 
          newRating: rating,         
          newComment: reviewText,    
          // Variables spécifiques à la création :
          rating: rating,            
          comment: reviewText        
        }),
      });

      const data = await response.json();

      if (data.result) {
        Alert.alert("Succès", data.message);

        if (isEditing) {
          // 🔄 MISE À JOUR LOCALE (Mode Édition)
          const updatedReviews = datas.reviews.map((r: any) => {
            if (r._id === editingReviewId) {
              return { ...r, rating: rating, comment: reviewText };
            }
            return r;
          });
          setDatas({ ...datas, reviews: updatedReviews });
          
          // On ferme le mode édition
          setIsEditing(false);
          setEditingReviewId(null);
          setRating(0);
          setReviewText('');

        } else {
          // ➕ AJOUT LOCAL (Mode Création)
          const newReview = {
            _id: data.reviewId,
            userid: user._id,
            rating: rating,
            comment: reviewText,
            createdAt: new Date().toISOString(),
            likes: [], 
            replies: [] 
          };

          setDatas({
            ...datas,
            reviews: [...(datas.reviews || []), newReview]
          });
          if (mode === 'collection' && indexMovie !== -1) {
            console.log(newReview)
            dispatch(addReviewToStore({ index: indexMovie, review: newReview }));
          }

          setRating(0);
          setReviewText('');
        }
      } else {
        Alert.alert("Accès refusé", data.error);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de contacter le serveur.");
    }
  };

  // Liker un avis
  const handleLikeReview = async (reviewId: string) => {
    if (!reviewId) return; // Si l'avis vient d'être créé et n'a pas encore de vrai _id
    try {
      const response = await fetch(`${BACKEND_URL}/users/like-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: user.token, tmdb_id: datas.tmdb_id, reviewId }),
      });
      const data = await response.json();

      if (data.result) {
        const updatedReviews = datas.reviews.map((r: any) => {
          if (r._id === reviewId) {
            const hasLiked = r.likes?.includes(user._id);
            return {
              ...r,
              likes: hasLiked ? r.likes.filter((id: string) => id !== user._id) : [...(r.likes || []), user._id]
            };
          }
          return r;
        });
        setDatas({ ...datas, reviews: updatedReviews });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Répondre à un avis
  const handleReplyReview = async (reviewId: string) => {
    if (!replyText.trim() || !reviewId) return;
    try {
      const response = await fetch(`${BACKEND_URL}/users/reply-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: user.token, tmdb_id: datas.tmdb_id, reviewId, text: replyText }),
      });
      const data = await response.json();

      if (data.result) {
        const newReply = { userid: user._id, text: replyText, createdAt: new Date().toISOString() };
        const updatedReviews = datas.reviews.map((r: any) => {
          if (r._id === reviewId) {
            return { ...r, replies: [...(r.replies || []), newReply] };
          }
          return r;
        });
        setDatas({ ...datas, reviews: updatedReviews });
        setReplyingTo(null);
        setReplyText('');
      } else {
        Alert.alert("Erreur", data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatReviewDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getReviewerName = (reviewerId: any) => {
    if (!reviewerId) return 'Inconnu';
    if (reviewerId.username) {
      if (reviewerId.username === user.username) return 'Moi';
      return reviewerId.username;
    }
    const id = reviewerId._id || reviewerId;
    const friend = user.friends?.find((f: any) => (f.userid?._id || f.userid) === id || f._id === id);
    if (friend) return friend.username;
    return 'Moi';
  };

  // Calcul de moyenne des notes
  const getAverageRating = () => {
    if (!datas.reviews || datas.reviews.length === 0) return 0;
    const ratedReviews = datas.reviews.filter((r: any) => r.rating && r.rating > 0);
    if (ratedReviews.length === 0) return 0;
    const total = ratedReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    return total / ratedReviews.length;
  };

  //supprimer un avis
  const handleDeleteReview = async (reviewId: string) => {
    console.log("🗑️ Clic suppression ! ID de l'avis à supprimer :", reviewId);
    Alert.alert(
      "Supprimer l'avis",
      "Êtes-vous sûr de vouloir supprimer cet avis ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/users/delete-review`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  token: user.token,
                  tmdb_id: datas.tmdb_id,
                  reviewId: reviewId
                }),
              });
              const data = await response.json();
              console.log("📥 Réponse du Backend pour la suppression :", data);
              if (data.result) {
                const updatedReviews = datas.reviews.filter((r: any) => r._id !== reviewId);
                setDatas({ ...datas, reviews: updatedReviews });
                Alert.alert("Succès", "L'avis a été supprimé avec succès.");
              } else {
                Alert.alert("Erreur", "Impossible de supprimer l'avis.");
              }
            } catch (error) {
              console.error(error);
            }
          },
        },
      ]
    );
  };

  // Modifier une réponse
  const submitEditReply = async (reviewId: string, replyId: string) => {
    if (!editReplyText.trim()) return;
    try {
      const response = await fetch(`${BACKEND_URL}/users/edit-reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: user.token, tmdb_id: datas.tmdb_id, reviewId, replyId, newText: editReplyText }),
      });
      const data = await response.json();
      if (data.result) {
        const updatedReviews = datas.reviews.map((r: any) => {
          if (r._id === reviewId) {
            const updatedReplies = r.replies.map((rep: any) => {
              if (rep._id === replyId) return { ...rep, text: editReplyText };
              return rep;
            });
            return { ...r, replies: updatedReplies };
          }
          return r;
        });
        setDatas({ ...datas, reviews: updatedReviews });
        setEditingReplyId(null);
        setEditReplyText('');
      } else {
        Alert.alert("Erreur", data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Supprimer une réponse
  const handleDeleteReply = async (reviewId: string, replyId: string) => {
    Alert.alert(
      "Supprimer la réponse",
      "Confirmez-vous la suppression de cette réponse ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/users/delete-reply`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: user.token, tmdb_id: datas.tmdb_id, reviewId, replyId }),
              });
              const data = await response.json();
              if (data.result) {
                const updatedReviews = datas.reviews.map((r: any) => {
                  if (r._id === reviewId) {
                    return { ...r, replies: r.replies.filter((rep: any) => rep._id !== replyId) };
                  }
                  return r;
                });
                setDatas({ ...datas, reviews: updatedReviews });
              } else {
                Alert.alert("Erreur", data.error);
              }
            } catch (error) {
              console.error(error);
            }
          }
        }
      ]
    );
  };





  return (

    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : 'height'}
      keyboardVerticalOffset={-110} style={styles.modalOverlay}>
      <View style={styles.modalContent}>

        <ScrollView contentContainerStyle={styles.modalScroll} style={{ flexShrink: 1 }}>
          <TouchableOpacity onPress={() => handleLike()} disabled={(mode == 'friend') ? (true) : (false)} style={{ marginLeft: '90%' }}>
            {drawHeart()}
          </TouchableOpacity>
          <View style={styles.posterContainer}>
            <Poster
              imageUrl={imageUrl}
              isLoaned={datas.isLoaned}
              columns={2}
            />
          </View>

          <Text style={styles.modalTitle}>{datas?.title_fr || datas?.original_title}</Text>
          <View style={{ alignItems: 'center', marginBottom: 15, marginTop: -10 }}>
            {getAverageRating() > 0 ? (
              <>
                <Text style={{ color: '#e8be4b', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>
                  Note des utilisateurs ({(mode == 'friend') ? datas.reviews.length : user.movies.find((film) => film.tmdb_id == moviedata.tmdb_id).reviews.length } avis)
                </Text>
                <StarRating rating={Math.round(getAverageRating() * 2) / 2} size={16} disabled={true} />
              </>
            ) : (
              <Text style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic' }}>
                Aucune note pour le moment
              </Text>
            )}
          </View>

          {mode !== 'add' && (
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'details' && styles.activeTabButton]}
                onPress={() => setActiveTab('details')}
              >
                <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>Détails</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'reviews' && styles.activeTabButton]}
                onPress={() => setActiveTab('reviews')}
              >
                <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>Avis</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'details' ? (
            <View style={styles.modalInfoGrid}>
              {(datas?.title_fr !== datas?.original_title) ? (<Text style={styles.modalLabel}>Titre original : <Text style={styles.modalText}>{datas?.original_title}</Text></Text>) : (<></>)}
              <Text style={styles.modalLabel}>Date de sortie : <Text style={styles.modalText}>{datas?.release_date}</Text></Text>
              <Text style={styles.modalLabel}>Réalisé par :</Text>
              {renderClickableNames(datas?.DirectedBy, 'director')}
              <Text style={styles.modalLabel}>Genre :</Text>
              {renderClickableNames(datas?.Genres, 'genre')}
              <Text style={styles.modalLabel}>Compositeur : </Text>
              {renderClickableNames(datas?.MusicBy, 'composer')}
              <Text style={styles.modalLabel}>Casting :</Text>
              {renderClickableNames(datas?.Cast, 'actor', 15)}

              {mode === 'collection' && (
                <View style={{ marginTop: 15, width: '100%', alignItems: 'center' }}>
                  <Buttons
                    title="🗑️ Supprimer le film"
                    onPress={onDeleteClick}
                    variant="primary"
                    style={{ backgroundColor: '#d9534f', width: '80%' }}
                  />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.reviewsContainer}>
              
              {/* Formulaire pour laisser un NOUVEL avis UNIQUEMENT */}
              {didIMakeAReview() ? null : (
                <View style={styles.reviewFormContainer}>
                  <Text style={styles.modalLabel}>Laissez votre avis :</Text>

                  <StarRating
                    rating={rating}
                    onRatingPress={(newRating) => setRating(newRating)}
                  />
                  
                  <TextInput
                    style={styles.textInput}
                    placeholder="Qu'avez-vous pensé de ce film ?"
                    placeholderTextColor="#888"
                    multiline={true}
                    numberOfLines={4}
                    value={reviewText}
                    onChangeText={setReviewText}
                  />
                  
                  <Buttons
                    title="Publier mon avis"
                    onPress={handlePublishReview}
                    variant="outline"
                  />
                </View>
              )}

              {/* 🌟 LA LISTE DES AVIS */}
              {datas.reviews && datas.reviews.length > 0 ? (
                <View style={styles.reviewsList}>
                  {datas.reviews.map((review: any, index: number) => {
                    // 🔒 LOGIQUE DE MODÉRATION
                    const isMyReview = review.userid?._id === user._id || review.userid === user._id;
                    const isMyCollection = mode !== 'friend' && mode !== 'add';

                    // Sommes-nous en train de modifier CE commentaire précis ?
                    const isEditingThisReview = isEditing && editingReviewId === review._id;

                    return (
                      <View key={index} style={styles.reviewItem}>

                        <View style={styles.reviewHeader}>
                          <Text style={styles.reviewAuthor}>{getReviewerName(review.userid)}</Text>
                          <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
                        </View>

                        {/* 🌟 MAGIE IN-LINE : Affichage ou Modification ? */}
                        {isEditingThisReview ? (
                          
                          /* MODE ÉDITION : Le commentaire devient un formulaire */
                          <View style={{ marginTop: 10 }}>
                            <View style={{ alignItems: 'flex-start', marginBottom: 10 }}>
                              <StarRating rating={rating} onRatingPress={(newRating) => setRating(newRating)} />
                            </View>
                            
                            <TextInput
                              style={styles.textInput}
                              multiline={true}
                              value={reviewText}
                              onChangeText={setReviewText}
                              autoFocus={true} // Ouvre le clavier directement !
                            />
                            
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                              <View style={{ flex: 1 }}>
                                <Buttons title="Enregistrer" onPress={handlePublishReview} variant="outline" />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Buttons
                                  title="Annuler"
                                  onPress={() => {
                                    setIsEditing(false);
                                    setEditingReviewId(null);
                                    setRating(0);
                                    setReviewText('');
                                  }}
                                  variant="primary"
                                  style={{ backgroundColor: '#555' }}
                                />
                              </View>
                            </View>
                          </View>

                        ) : (
                          
                          /* MODE LECTURE : L'affichage classique */
                          <>
                            <View style={{ alignItems: 'flex-start', marginVertical: -5 }}>
                              <StarRating rating={review.rating} size={14} disabled={true} />
                            </View>

                            {review.comment ? (
                              <Text style={styles.reviewText}>{review.comment}</Text>
                            ) : null}
                          </>
                          
                        )}

                        {/* On cache ces boutons si on est en train de modifier */}
                        {!isEditingThisReview && (
                          <>
                            {/* 🌟 BOUTONS LIKE ET RÉPONDRE */}
                            {mode !== 'friend' && review._id && (
                              <View style={styles.reviewActions}>
                                <TouchableOpacity onPress={() => handleLikeReview(review._id)} style={styles.actionBtn}>
                                  <FontAwesome
                                    name={review.likes?.includes(user._id) ? "heart" : "heart-o"}
                                    size={15}
                                    color={review.likes?.includes(user._id) ? "#e8be4b" : "#aaa"}
                                  />
                                  <Text style={{ color: review.likes?.includes(user._id) ? '#e8be4b' : '#aaa', fontWeight: 'bold', marginLeft: 6 }}>
                                    {review.likes?.length || 0}
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setReplyingTo(replyingTo === review._id ? null : review._id)} style={styles.actionBtn}>
                                  <FontAwesome name="comment-o" size={15} color="#aaa" />
                                  <Text style={[styles.actionText, { marginLeft: 6 }]}>
                                    Répondre
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}

                            {/* 🌟 BOUTONS MODIFIER / SUPPRIMER POUR L'AVIS */}
                            {(isMyReview || isMyCollection) && (
                              <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 15, marginTop: 10 }}>
                                {/* Le crayon n'est visible que pour l'auteur */}
                                {isMyReview && (
                                  <TouchableOpacity
                                    style={{ padding: 4 }}
                                    onPress={() => {
                                      setIsEditing(true);
                                      setEditingReviewId(review._id);
                                      setRating(review.rating || 0);  
                                      setReviewText(review.comment || ''); 
                                    }}
                                  >
                                    <FontAwesome name="pencil" size={16} color="#aaa" />
                                  </TouchableOpacity>
                                )}

                                {/* La poubelle est visible pour l'auteur ET le proprio de la collection */}
                                <TouchableOpacity style={{ padding: 4 }} onPress={() => handleDeleteReview(review._id)}>
                                  <FontAwesome name="trash-o" size={16} color="#d9534f" />
                                </TouchableOpacity>
                              </View>
                            )}
                          </>
                        )}

                        {/* 🌟 CHAMP DE TEXTE POUR RÉPONDRE */}
                        {replyingTo === review._id && (
                          <View style={styles.replyInputBox}>
                            <TextInput
                              style={styles.replyInput}
                              placeholder="Écrivez votre réponse..."
                              placeholderTextColor="#888"
                              value={replyText}
                              onChangeText={setReplyText}
                              autoFocus={true}
                            />
                            <TouchableOpacity onPress={() => handleReplyReview(review._id)} style={styles.replySendBtn}>
                              <Text style={styles.replySendText}>OK</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {/* 🌟 AFFICHAGE DES RÉPONSES */}
                        {review.replies && review.replies.length > 0 && (
                          <View style={styles.repliesList}>
                            {review.replies.map((reply: any, rIndex: number) => {
                              
                              // 🔒 LOGIQUE DE MODÉRATION POUR LES RÉPONSES
                              const isMyReply = reply.userid?._id === user._id || reply.userid === user._id;

                              return (
                                <View key={rIndex} style={styles.replyItem}>
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.replyAuthor}>{getReviewerName(reply.userid)} :</Text>
                                    
                                    {/* Actions Modifier / Supprimer la réponse */}
                                    {(isMyReply || isMyCollection) && (
                                      <View style={{ flexDirection: 'row', gap: 18, paddingLeft: 10 }}>
                                        {isMyReply && (
                                          <TouchableOpacity 
                                            style={{ padding: 4 }}
                                            onPress={() => {
                                              setEditingReplyId(reply._id);
                                              setEditReplyText(reply.text);
                                            }}
                                          >
                                            <FontAwesome name="pencil" size={18} color="#aaa" />
                                          </TouchableOpacity>
                                        )}
                                        <TouchableOpacity 
                                          style={{ padding: 4 }}
                                          onPress={() => handleDeleteReply(review._id, reply._id)}
                                        >
                                          <FontAwesome name="trash-o" size={18} color="#d9534f" />
                                        </TouchableOpacity>
                                      </View>
                                    )}
                                  </View>

                                  {/* Si on est en train de modifier cette réponse précise */}
                                  {editingReplyId === reply._id ? (
                                    <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                      <TextInput
                                        style={[styles.replyInput, { flex: 1, paddingVertical: 4 }]}
                                        value={editReplyText}
                                        onChangeText={setEditReplyText}
                                        autoFocus={true}
                                      />
                                      <TouchableOpacity onPress={() => submitEditReply(review._id, reply._id)} style={[styles.replySendBtn, { paddingHorizontal: 8, paddingVertical: 6 }]}>
                                        <Text style={styles.replySendText}>OK</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity onPress={() => setEditingReplyId(null)} style={[styles.replySendBtn, { backgroundColor: '#555', paddingHorizontal: 8, paddingVertical: 6 }]}>
                                        <Text style={[styles.replySendText, { color: '#fff' }]}>X</Text>
                                      </TouchableOpacity>
                                    </View>
                                  ) : (
                                    <Text style={styles.replyTextContent}>{reply.text}</Text>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        )}

                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.reviewPlaceholder}>
                  Aucun avis pour le moment. Soyez le premier !
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.modalButtonsRow}>
          {mode === 'manage_request' ? (
            <>
              <View style={{ flex: 1 }}>
                <Buttons
                  title="Refuser"
                  onPress={handleRefuse}
                  variant="primary"
                  style={{ backgroundColor: '#d9534f' }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Buttons
                  title={`Prêter à ${requester?.username}`}
                  onPress={() => setIsLoanModalVisible(true)}
                  variant="primary"
                />
              </View>
            </>
          ) : (
            <>
              <View style={{ flex: 1 }}>
                <Buttons title="Retour" onPress={() => setModalVisible()} variant="primary" />
              </View>
              <View style={{ flex: 1 }}>
                {mode === 'add' ? (
                  <Buttons title="Ajouter" onPress={handleAddMovie} variant="primary" />
                ) : mode === 'friend' ? (
                  datas?.isLoaned ? (
                    <View style={{ backgroundColor: 'rgba(217, 83, 79, 0.2)', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d9534f', alignItems: 'center' }}>
                      <Text style={{ color: '#d9534f', fontWeight: 'bold' }}>Indisponible</Text>
                    </View>
                  ) : (
                    <Buttons title="Demander" onPress={onAskMovie} variant="primary" />
                  )
                ) : (
                  datas?.isLoaned ? (
                    <Buttons title="Détails du prêt" onPress={() => setIsLoanDetailsVisible(true)} variant="primary" style={{ backgroundColor: '#e8be4b' }} />
                  ) : (
                    <Buttons title="Prêter" onPress={() => setIsLoanModalVisible(true)} variant="primary" />
                  )
                )}
              </View>
            </>
          )}
        </View>

      </View>

      <LoanModal
        visible={isLoanModalVisible}
        onClose={() => setIsLoanModalVisible(false)}
        movie={datas}
        movieTmdbId={datas?.tmdb_id}
        preselectedUser={requester}
        notificationId={notificationId}
        onSuccess={(updatedPastLoans) => {
          setDatas({
            ...datas,
            isLoaned: true,
            pastLoans: updatedPastLoans
          });

          setIsLoanModalVisible(false);
          if (typeof setIsModalVisible === 'function') {
            setIsModalVisible(false);
          } else if (typeof setModalVisible === 'function') {
            setModalVisible();
          }
        }}
      />

      <LoanDetailsModal
        visible={isLoanDetailsVisible}
        onClose={() => setIsLoanDetailsVisible(false)}
        movieName={datas?.title_fr || datas?.original_title || 'ce film'}
        movieTmdbId={datas?.tmdb_id}
        currentLoan={currentLoan}
        onReturnSuccess={() => setDatas({ ...datas, isLoaned: false })}
      />

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8be4b',
  },
  modalScroll: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  posterContainer: {
    width: 200,
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalInfoGrid: {
    width: '100%',
    marginBottom: 25,
  },
  modalLabel: {
    color: '#e8be4b',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 18,
  },
  modalText: {
    color: '#fff',
    fontWeight: 'normal',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 10,
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 20,
    marginTop: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#e8be4b',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#e8be4b',
  },
  reviewsContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  reviewPlaceholder: {
    color: '#aaa',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  reviewFormContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 5,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(232, 190, 75, 0.3)',
  },
  reviewsList: {
    width: '100%',
    marginBottom: 20,
  },
  reviewItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    color: '#e8be4b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewDate: {
    color: '#aaa',
    fontSize: 12,
  },
  reviewText: {
    color: '#fff',
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 22,
  },

  // 🌟 NOUVEAUX STYLES : Boutons d'action et champs de réponse
  reviewActions: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
  },
  actionBtn: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
  },
  replyInputBox: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  replyInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  replySendBtn: {
    marginLeft: 10,
    backgroundColor: '#e8be4b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  replySendText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 12,
  },
  repliesList: {
    marginTop: 10,
    paddingLeft: 15,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(232, 190, 75, 0.5)',
  },
  replyItem: {
    marginTop: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 8,
    borderRadius: 5,
  },
  replyAuthor: {
    color: '#e8be4b',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  replyTextContent: {
    color: '#ddd',
    fontSize: 13,
    fontStyle: 'italic',
  },
});