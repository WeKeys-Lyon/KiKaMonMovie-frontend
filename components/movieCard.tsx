import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Modal, Alert, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Buttons } from '../components/buttons';
import { addMovieToStore, addReviewToStore } from '../reducers/user';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import Poster from '../components/poster';
import LoanModal from './loanModal';
import LoanDetailsModal from './loanDetailsModale';
import StarRating from '../components/starRating';
import FontAwesome  from '@react-native-vector-icons/fontawesome';
import {iLikeThisMovie} from '../reducers/user';


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
  onDeleteClick: () => void;
  onAddSuccess?: () => void;
  onAskMovie?: () => void;
  ownerId?: string;
};


export default function MovieCard({ navigation, clickable, moviedata, setIsModalVisible, drawStyle, mode = 'add', onFilterClick, onDeleteClick, onAddSuccess, onAskMovie, requester, notificationId, ownerId }: MovieCardScreenProps) {

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

  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');

  const currentLoan = datas?.pastLoans && datas.pastLoans.length > 0 
    ? datas.pastLoans[datas.pastLoans.length - 1] 
    : null;

  useEffect(() => {
    const init = async () => {
      if (drawStyle) {
        const myURL = `${BACKEND_URL}/movies/searchid/${moviedata.tmdb_id}`
        const response = await fetch(encodeURI(myURL));
        const data = await response.json();
        if (data.result) {
          setDatas(data.answer);
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
    datas.poster_path ? imageUrl = `https://res.cloudinary.com/dj5fkdyn8/image/upload/v1781111174${datas.poster_path}`: imageUrl = false;
  }

  //aller sur la modale de prêt
  const onLendClick = () => {
    setIsLoanModalVisible(true);
  };
  const indexMovie = user.movies.findIndex(film => moviedata.tmdb_id == film.tmdb_id);

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
      dispatch(iLikeThisMovie({index: indexMovie}))    
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

  //poster un avis (si on a emprunté le film)
  const handlePublishReview = async () => {
    if (rating === 0 && reviewText.trim() === '') {
      Alert.alert("Oups", "Veuillez laisser une note ou un commentaire.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/users/add-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: user.token,
          ownerId: ownerId || user._id, // Si pas d'ownerId, on envoie mon propre ID
          tmdb_id: datas.tmdb_id,
          rating: rating,
          comment: reviewText
        }),
      });

      const data = await response.json();

      if (data.result) {
        Alert.alert("Succès", data.message);
      const newReview = {
          userid: { username: user.username }, 
          rating: rating,
          comment: reviewText,
          createdAt: new Date().toISOString()
        };
        
        setDatas({
          ...datas,
          reviews: [...(datas.reviews || []), newReview]
        });
        if (mode === 'collection' && indexMovie !== -1) {
          dispatch(addReviewToStore({ index: indexMovie, review: newReview }));
        }

        // On vide le formulaire
        setRating(0); 
        setReviewText('');
      } else {
        Alert.alert("Accès refusé", data.error);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de contacter le serveur.");
    }
  };

  // Formater la date proprement (ex: 12 juin 2026)
  const formatReviewDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Retrouver le pseudo en fonction de l'ID
  const getReviewerName = (reviewerId: any) => {
    if (!reviewerId) return 'Inconnu';
    
    // CAS 1 : C'est notre avis généré instantanément (avec le pseudo)
    if (reviewerId.username) {
      if (reviewerId.username === user.username) return 'Moi';
      return reviewerId.username;
    }

    // CAS 2 : C'est un ID brut venant du backend
    const id = reviewerId._id || reviewerId;
    
    // On cherche dans la liste de tes amis
    const friend = user.friends?.find((f: any) => (f.userid?._id || f.userid) === id || f._id === id);
    if (friend) return friend.username;

    // 🌟 ASTUCE : Si l'auteur n'est pas dans tes amis, c'est forcément que c'est TON avis !
    return 'Moi'; 
  };

 return (            
      <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : 'height'}
        keyboardVerticalOffset={50}
        >
        <ScrollView contentContainerStyle={styles.modalScroll} style={{ flexShrink: 1 }}>
          <TouchableOpacity onPress={() => handleLike()}  style={{marginLeft:'90%'}}>
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

          {/* 🌟 NOUVEAU : Menu des onglets */}
          {mode !== 'add' && ( // On n'affiche pas l'onglet "Avis" lors de la première recherche TMDB
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

          {/* 🌟 CONTENU CONDITIONNEL SELON L'ONGLET */}
          {activeTab === 'details' ? (
            // --- VUE DÉTAILS TECHNIQUES ---
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
            // --- 🌟 NOUVEAU : VUE SOCIALE (AVIS) ---
            <View style={styles.reviewsContainer}>
             {/* 🌟 LA LISTE DES AVIS */}
              {datas.reviews && datas.reviews.length > 0 ? (
                <View style={styles.reviewsList}>
                  {datas.reviews.map((review: any, index: number) => (
                    <View key={index} style={styles.reviewItem}>
                      
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewAuthor}>{getReviewerName(review.userid)}</Text>
                        <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
                      </View>
                      
                      {/* Note : disabled={true} car on est juste en lecture ! */}
                      <View style={{ alignItems: 'flex-start', marginVertical: -5 }}>
                        <StarRating rating={review.rating} size={14} disabled={true} />
                      </View>
                      
                      {review.comment ? (
                        <Text style={styles.reviewText}>{review.comment}</Text>
                      ) : null}

                    </View>
                    
                  ))}
                </View>
              ) : (
                <Text style={styles.reviewPlaceholder}>
                  Aucun avis pour le moment. Soyez le premier !
                </Text>
              )}

              {/* Formulaire pour laisser un avis */}
                <View style={styles.reviewFormContainer}>
                <Text style={styles.modalLabel}>Laissez votre avis :</Text>
                
                <StarRating 
                  rating={rating} 
                  onRatingPress={(newRating) => setRating(newRating)} 
                />
                <>
                <TextInput
                  style={styles.textInput}
                  placeholder="Qu'avez-vous pensé de ce film ?"
                  placeholderTextColor="#888"
                  multiline={true}
                  numberOfLines={4}
                  value={reviewText}
                  onChangeText={setReviewText}
                />
                </>
                <Buttons 
                  title="Publier mon avis" 
                  onPress={handlePublishReview}
                  variant="outline" 
                />
              </View>
            </View>
            
          )}
        </ScrollView>

        </KeyboardAvoidingView>
        <View style={styles.modalButtonsRow}>
          {mode === 'manage_request' ? (
            // 🚨 MODE DÉCISION (Venant d'une notification)
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
            // 🏠 MODES CLASSIQUES
            <>
              <View style={{ flex: 1 }}>
                <Buttons title="Retour" onPress={() => setModalVisible()} variant="primary" />
              </View>
              <View style={{ flex: 1 }}>
                {mode === 'add' ? (
                  // 1️⃣ MODE AJOUT
                  <Buttons title="Ajouter" onPress={handleAddMovie} variant="primary" />
                ) : mode === 'friend' ? (
                  // 2️⃣ MODE AMI
                  datas?.isLoaned ? (
                    <View style={{ backgroundColor: 'rgba(217, 83, 79, 0.2)', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d9534f', alignItems: 'center' }}>
                      <Text style={{ color: '#d9534f', fontWeight: 'bold' }}>Indisponible</Text>
                    </View>
                  ) : (
                    <Buttons title="Demander" onPress={onAskMovie} variant="primary" />
                  )
                ) : (
                  // 3️⃣ MODE COLLECTION (Par défaut)
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
      
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles de la Modale
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
  // 🌟 NOUVEAU : Styles pour les onglets
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

 // --- Styles pour la zone des avis ---
  reviewsContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  reviewPlaceholder: {
    color: '#aaa',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  reviewFormContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 10,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top', // Très important pour les champs multiline sur Android
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(232, 190, 75, 0.3)',

  },
  // --- Styles des avis ---
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
});
