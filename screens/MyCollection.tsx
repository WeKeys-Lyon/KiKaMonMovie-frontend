import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, TouchableOpacity, Dimensions, Modal, Alert, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { Buttons } from '../components/buttons';
import MovieGrid from '../components/MovieGrid';
import MovieCard from '../components/movieCard';
import ProfileMenuModal from '../components/menuProfileModal';
import NotificationModal from '../components/notificationsModal';
import SettingsModal from '../components/settingsModal';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { User, movieProps, notificationsProps } from '../components/types';

import { removedMovieFromStore, logout, updateNotifications, settingColumns, settingSort, setCollection } from '../reducers/user';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowBanner: true, // 👈 Nouveau standard iOS/Expo
      shouldShowList: true,   // 👈 Nouveau standard iOS/Expo
      shouldPlaySound: true, 
      shouldSetBadge: false,
    };
  },
});



type MyCollectionProps = {
  navigation: NavigationProp<ParamListBase>;
};

const BACKEND_URL = process.env.BACKEND_URL;

const { width } = Dimensions.get('window');

export default function MyCollection({ navigation }: MyCollectionProps) {

  const user = useSelector((state: {_persist: any, user: {value: User}}) => state.user.value);
  const movies = useSelector((state: {_persist: any, user: {value: User}}) => state.user.value.movies);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [columns, setColumns] = useState(user.columns ? user.columns : 2);
  const [titleOriginal ,setTitleOriginal] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const lastNotificationResponse = Notifications.useLastNotificationResponse();


  const dispatch = useDispatch();
  const processDeepLink = async (data: any) => {
    navigation.navigate('Ma Collection'); 
    try {
      const notifResponse = await fetch(`${BACKEND_URL}/users/notifications/${user.token}`);
      const notifData = await notifResponse.json();
      if (notifData.result) dispatch(updateNotifications(notifData.notifications));

      const colResponse = await fetch(`${BACKEND_URL}/users/collection/${user.token}`);
      const colData = await colResponse.json();
      
      let targetMovie = null;
      let ownerToPass = null;

      if (colData.result) {
        targetMovie = colData.movies.find((m: movieProps) => String(m.tmdb_id) === String(data.tmdb_id));
      }

      if (!targetMovie && notifData.result) {
        const notifItem = notifData.notifications.find((n: notificationsProps) => String(n.movieId?.tmdb_id) === String(data.tmdb_id));
        if (notifItem) {
          targetMovie = notifItem.movieId;
          ownerToPass = data.ownerId || notifItem.senderId?._id || notifItem.senderId;
        }
      }

      if (targetMovie) {
        setSelectedMovie(targetMovie);
        setMovieOwnerId(ownerToPass); 
        setTargetTab(data.type === 'review' ? 'reviews' : 'details');
        setIsModalVisible(true);
      } else {
        setIsNotificationModalVisible(true); 
      }
    } catch (error) {
      console.error("Erreur Deep Link :", error);
      setIsNotificationModalVisible(true);
    }
  };

 useEffect(() => {
    if (
      lastNotificationResponse && 
      lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      const data = lastNotificationResponse.notification.request.content.data;
      console.log("🕸️ Démarrage à froid ! Données reçues :", data);
      
      // 🧹 ON VIDE LA MÉMOIRE EXPO POUR ÉVITER LA BOUCLE INFINIE
      Notifications.clearLastNotificationResponseAsync();
      
      if (data && data.tmdb_id) {
        // 🚀 Appel magique de notre fonction allégée !
        processDeepLink(data);
      } else {
        navigation.navigate('Ma Collection');
        setIsNotificationModalVisible(true);
      }
    }
  }, [lastNotificationResponse, user.token, dispatch]);

 useEffect(() => {
    if (!user.token) {
      navigation.navigate('Home');
    } else {
      // 1. On génère le token
      registerForPushNotificationsAsync();

      // 2. On écoute le clic en direct
      const responseListener = Notifications.addNotificationResponseReceivedListener(async response => {
        const data = response.notification.request.content.data;
        
        console.log("👆 Notification cliquée ! Données reçues :", data);
        
        if (data && data.tmdb_id) {
          // 🚀 Le même appel magique pour faire exactement la même chose !
          processDeepLink(data);
        } else {
          navigation.navigate('Ma Collection');
          setIsNotificationModalVisible(true);
        }
      });

      // 3. Le nettoyage
      return () => {
        responseListener.remove();
      };
    }
  }, [user.token]);

  const getCardWidth = () => {
    if (columns === 1) return '100%';
    return (width * 0.9) / columns - 10;
  };
  const cardWidth = getCardWidth();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<{ type: string, value: string } | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [sortOption, setSortOption] = useState<string>(user.sort ? user.sort : 'title_asc');
  const [sortOption2, setSortOption2] = useState<string>('');
  const [likedActivated, setLikedActivated] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [movieOwnerId, setMovieOwnerId] = useState<string | null>(null);
  const [targetTab, setTargetTab] = useState<string>('details');
  
  const modColumns = (number: number) => {
    setColumns(number);
    dispatch(settingColumns(number));
  }
  
  const modSort = (string: string) => {
    setSortOption(string);
    dispatch(settingSort(string));
  }
  const modSort2 = (string: string) => {
    setSortOption2(string);
    setLikedActivated(!likedActivated)
  }
  const modSelectedYear = (number: number) => {
    setSelectedYear(number);
  }

  //Demande de permission et récupération du token 
  const registerForPushNotificationsAsync = async () => {
    console.log("🚀 [1] Lancement de la demande de Push Token...");
    let token;

    try {
      if (!Device.isDevice) {
        console.log("❌ [Arrêt] Tu es sur un simulateur. Prends ton vrai téléphone !");
        return;
      }

      console.log("📱 [2] Appareil physique détecté. Vérification des permissions...");

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log("⚠️ [3] Permission non accordée. Ouverture de la popup...");
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log("❌ [Arrêt] L'utilisateur a refusé les notifications.");
        return;
      }

      console.log("✅ [4] Permissions accordées ! Génération du Token Expo...");
      
      // 🌟 NOUVEAU : Récupération du Project ID (obligatoire sur Expo SDK 49+)
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("🎟️ [5] VICTOIRE ! Push Token généré :", token);

      if (token && user.token) {
        await fetch(`${process.env.BACKEND_URL}/users/save-push-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: user.token, pushToken: token })
        });
        console.log("💾 [6] Push Token sauvegardé dans la base de données !");
      }

    } catch (error) {
      // 🌟 LE FILET DE SÉCURITÉ : S'il y a une erreur invisible, on l'attrape ici !
      console.error("🚨 ERREUR LORS DE LA GÉNÉRATION DU TOKEN :", error);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#e8be4b',
      });
    }

    return token;
  };
  

//reception notifications
useFocusEffect(
    useCallback(() => {
      const fetchNotifications = async () => {
        if (!user.token) {
          console.log("Annulation : Le token est introuvable dans Redux.");
          return;
        }
        try {
          const response = await fetch(`${BACKEND_URL}/users/notifications/${user.token}`);
          const data = await response.json();

          if (data.result) {
            dispatch(updateNotifications(data.notifications));
          }
        } catch (error) {
          console.error("Erreur lors du fetch :", error);
        }
      };

      fetchNotifications();
    }, [user.token])
  );

//calcul des notifications: 
const unreadCount = user.notifications?.filter((n) => !n.isRead).length || 0;

// 🧹 NOUVEAU : Nettoyage automatique de la notification quand on ferme la MovieCard
  useEffect(() => {
    if (!isModalVisible) {
      setActiveNotification(null);
      setMovieOwnerId(null);
    }
  }, [isModalVisible]);

  const handleOpenMovie = (movie: movieProps) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
    setMovieOwnerId(null); // On réinitialise l'ownerId à null pour les films de notre collection
    setTargetTab('details');
  };

  
  const safeMovies = movies || [];

  const filtredMovies = safeMovies
    // 1. LE FILTRE PAR CATÉGORIE (Genre, Réalisateur, etc.)
    .filter((movie) => {
      if (!activeFilter) return true;

      if (activeFilter.type === 'genre') {
        return movie.Genres?.some((genre) => genre.name === activeFilter.value);
      } else if (activeFilter.type === 'director') {
        return movie.DirectedBy?.some((director) => director.name === activeFilter.value);
      } else if (activeFilter.type === 'actor') {
        return movie.Cast?.some((actor) => actor.name === activeFilter.value);
      } else if (activeFilter.type === 'composer') {
        return movie.MusicBy?.some((composer) => composer.name === activeFilter.value);
      }
      return false;
    })
    // 2. LE FILTRE DE LA RECHERCHE GLOBALE
    .filter((movie) => {
      if (searchQuery.trim() === '') return true;
      const lowerQuery = searchQuery.toLowerCase();

      const title = (movie.title_fr || movie.original_title || '').toLowerCase();
      if (title.includes(lowerQuery)) return true;

      const year = movie.release_date ? movie.release_date.substring(0, 4) : '';
      if (year.includes(lowerQuery)) return true;

      const hasDirector = movie.DirectedBy?.some((d) => d.name?.toLowerCase().includes(lowerQuery));
      if (hasDirector) return true;

      const hasActor = movie.Cast?.some((a) => a.name?.toLowerCase().includes(lowerQuery));
      if (hasActor) return true;

      const hasComposer = movie.MusicBy?.some((c) => c.name?.toLowerCase().includes(lowerQuery));
      if (hasComposer) return true;

      return false;
    })
    // 3. Filtres optionnel
   .filter((movie) => {
      // Affichage des favoris
      if (likedActivated) {
        if (movie.isLiked) return true;
      } else {
        return true;
      }
    })
    .filter((movie) => {
      // Filtrer par année de sortie
      if (selectedYear > 0) {
        if (movie.release_date) {
          if (parseInt(movie.release_date.slice(0,4)) == selectedYear) {
            return true
          } else { return false}
      }
      } else {
        return true
      }
    })
    // 4. LE TRI 
    .sort((a, b) => {
      // Tri Alphabétique (A-Z)
      if (sortOption === 'title_asc') {
        const titleA = (a.title_fr || a.original_title || '').toLowerCase();
        const titleB = (b.title_fr || b.original_title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      }
      // Tri Alphabétique (Z-A)
      if (sortOption === 'title_desc') {
        const titleA = (a.title_fr || a.original_title || '').toLowerCase();
        const titleB = (b.title_fr || b.original_title || '').toLowerCase();
        return titleB.localeCompare(titleA);
      }
      // Tri par Année (Du plus récent au plus ancien)
      if (sortOption === 'year_desc') {
        const yearA = a.release_date ? parseInt(a.release_date.substring(0, 4)) : 0;
        const yearB = b.release_date ? parseInt(b.release_date.substring(0, 4)) : 0;
        return yearB - yearA;
      }
      // Tri par Année (Du plus ancien au plus récent)
      if (sortOption === 'year_asc') {
        const yearA = a.release_date ? parseInt(a.release_date.substring(0, 4)) : 0;
        const yearB = b.release_date ? parseInt(b.release_date.substring(0, 4)) : 0;
        return yearA - yearB;
      }
      // Tri Alphabétique Original (A-Z)
      if (sortOption === 'title_origin_asc') {
        const titleA = (a.original_title).toLowerCase();
        const titleB = (b.original_title).toLowerCase();
        return titleA.localeCompare(titleB);
      }
      if (sortOption === 'title_origin_desc') {
        const titleA = (a.original_title).toLowerCase();
        const titleB = (b.original_title).toLowerCase();
        return titleB.localeCompare(titleA);
      }
      // Tri par popularité :
      if (sortOption === 'popularity_desc') {
        const popA = (a.popularity);
        const popB = (b.popularity);
        if (popA && popB) {
          return popA - popB;
        }
      }
      if (sortOption === 'popularity_asc') {
        const popA = (a.popularity);
        const popB = (b.popularity);
        if (popA && popB) {
          return popB - popA;
        }
      }
      return 0;
    }); 

    const deleteMovie = async (tmdb_id: number) =>{
      try {
        const response = await fetch(`${BACKEND_URL}/users/delete-movie`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: user.token,
            tmdb_id: tmdb_id,
          }),
        });
        const data = await response.json();
        if (data.result) {
          console.log("Film supprimé");
          dispatch(removedMovieFromStore(tmdb_id));
          if (movies.length <= 1) {
            setIsDeleteMode(false);
          }
          }
        } catch (error) {
          console.error(error)
      }
    };

    const confirmDelete = (item: movieProps) => {
      const title = item.title_fr || item.original_title || '';
      if (item.isLoaned) {
        Alert.alert(
          'Film en cours de prêt',
        `Attention, "${title}" est actuellement en cours de prêt. Souhaitez-vous quand même le supprimer ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => {
              deleteMovie(item.tmdb_id);
              setIsDeleteMode(false);
            },
          },
        ]
      );
    } else {
      // ✅ ALERTE CLASSIQUE SI LE FILM N'EST PAS PRÊTÉ
      Alert.alert(
        'Supprimer le film',
        `Êtes-vous sûr de vouloir supprimer "${title}" de votre collection ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => {
              deleteMovie(item.tmdb_id);
              setIsDeleteMode(false);
            },
          },
        ]
      );
    }
  };
      
//gérer le prêt dans notif
const handleManageLoan = (notification: notificationsProps) => {
  setIsNotificationModalVisible(false);
  setActiveNotification(notification);
  const fullMovie = user.movies.find((m) => m.tmdb_id === notification.movieId?.tmdb_id
    );
    if (fullMovie) {
      setSelectedMovie(fullMovie);
      setIsModalVisible(true);
    } else {
      setSelectedMovie(notification.movieId);
      setIsModalVisible(true);
    }
}
//supprimer une notif$
const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/users/delete-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: user.token,
          notificationId: notificationId
        })
      });
      
      const data = await response.json();
      
      if (data.result) {
        const updatedNotifications = user.notifications.filter((n) => n._id !== notificationId);
        dispatch(updateNotifications(updatedNotifications));
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  //marquer toutes les notifs comme lues
  const handleMarkAllAsRead = async () => {
    // Sécurité : s'il n'y a pas de notifications non lues, inutile d'appeler le backend
    const hasUnread = user.notifications.some((n) => !n.isRead);
    if (!hasUnread) return;

    try {
      const response = await fetch(`${process.env.BACKEND_URL}/users/mark-all-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: user.token })
      });
      const data = await response.json();

      if (data.result) {
        // On met à jour Redux en clonant les notifs et en les passant à isRead: true
        const updatedNotifications = user.notifications.map((n) => ({
          ...n,
          isRead: true
        }));
        dispatch(updateNotifications(updatedNotifications));
      }
    } catch (error) {
      console.error("Erreur lors du marquage des notifications :", error);
    }
  };

  // Gérer les demandes d'amis (Accepter / Refuser)
  const handleManageFriendRequest = async (notification: notificationsProps, action: 'accept' | 'refuse') => {
    try {
      // On choisit la bonne route selon le bouton cliqué
      const endpoint = action === 'accept' ? 'accept-friend' : 'refuse-friend';
      
      const response = await fetch(`${process.env.BACKEND_URL}/users/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: user.token,
          notificationId: notification._id,
          senderId: notification.senderId?._id 
        })
      });

      const data = await response.json();

      if (data.result) {
        // Succès ! On retire la notification de la liste Redux pour l'effacer de l'écran
        const updatedNotifications = user.notifications.filter((n) => n._id !== notification._id);
        dispatch(updateNotifications(updatedNotifications));
        
        // Un petit message pour confirmer à l'utilisateur
        Alert.alert(
          action === 'accept' ? 'Nouvel ami !' : 'Demande refusée',
          data.message
        );
      } else {
        console.log("Erreur de gestion d'ami :", data.error);
      }
    } catch (error) {
      console.error(`Erreur lors de la gestion de l'ami (${action}) :`, error);
    }
  };

  // Gérer le clic sur "Réclamer"
  const handleRemindFriend = async (notification: notificationsProps) => {
    try {

      const response = await fetch(`${process.env.BACKEND_URL}/users/remind-loan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: user.token,
          borrowerId: notification.senderId?._id ? notification.senderId._id : '',
          movieId: notification.movieId?._id ? notification.movieId._id : ''
        })
      });

      const data = await response.json();

      if (data.result) {
        Alert.alert('Rappel envoyé 🔔', data.message);
      } else {
        Alert.alert('Oups', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du rappel :', error);
    }
  };

  //laisser une review
 const processReviewNotification = (notification: notificationsProps) => {
    // 1. On vérifie si on possède ce film dans notre propre collection
    const isMyMovie = user.movies?.some((m) => 
      String(m.tmdb_id) === String(notification.movieId)
    );
    
    const myURL = `http://${BACKEND_URL}/movies/searchid/${notification._id}`;
    fetch(encodeURI(myURL)).then(response => response.json()).then(data => console.log('HEY OH '));

    // 2. On récupère toutes les infos du film (les nôtres, ou celles de la notif)
    const fullMovie = isMyMovie 
      ? user.movies.find((m) => String(m.tmdb_id) === String(notification.movieId))
      : notification.movieId;

    setSelectedMovie(fullMovie);
    
    // 3. LA SÉCURITÉ : Si c'est mon film, ownerId est null. Sinon, c'est l'ID de l'ami.
    setMovieOwnerId(isMyMovie ? null : String(notification.senderId?._id || notification.senderId));
    
    setTargetTab('reviews');
    setIsNotificationModalVisible(false);
    setIsModalVisible(true);
  };

  // On relie tes deux fonctions à notre nouvelle logique blindée
  const handleLeaveReview = (notification: notificationsProps) => processReviewNotification(notification);
  const handleViewReview = (notification: notificationsProps) => processReviewNotification(notification);

  //rafraichir sa liste: 
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 🎬 1. On va chercher la collection fraîche
      const colResponse = await fetch(`${BACKEND_URL}/users/collection/${user.token}`);
      const colData = await colResponse.json(); 

      if (colData.result) {
        dispatch(setCollection(colData.movies)); 
      }

      // 🔔 2. On va chercher les notifications fraîches dans la foulée
      const notifResponse = await fetch(`${BACKEND_URL}/users/notifications/${user.token}`);
      const notifData = await notifResponse.json();

      if (notifData.result) {
        dispatch(updateNotifications(notifData.notifications));
      }

    } catch (error) {
      console.error("Erreur lors du rafraîchissement global :", error);
    } finally {
      // 🌟 Quoi qu'il arrive, on arrête la roue de chargement
      setRefreshing(false); 
    }
  }, [user.token, dispatch]);

  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <Header title="Ma Collection"
        leftIcon={<FontAwesome name="user-circle" size={24} color="#e8be4b" />}
        onPressLeft={() => setIsProfileMenuVisible(true)}
        rightIcon={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            {/* La Cloche */}
            <TouchableOpacity onPress={() => setIsNotificationModalVisible(true)}>
              <View>
                <FontAwesome name="bell" size={22} color="#e8be4b" />
                {unreadCount > 0 && (
                  <View style={{
                    position: 'absolute', top: -5, right: -8,
                    backgroundColor: '#d9534f', borderRadius: 10,
                    width: 18, height: 18, justifyContent: 'center', alignItems: 'center'
                  }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* L'Engrenage */}
            <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
              <FontAwesome name="cog" size={24} color="#e8be4b" />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.container}>
        {/*Pastille de recherche actie*/}
        {searchQuery.length > 0 && (
          <View style={styles.activeFilterBanner}>
            <Text style={styles.filterText} numberOfLines={2}>
              Recherche : <Text style={{ fontWeight: 'bold' }}>{searchQuery}</Text>
            </Text>
            <TouchableOpacity onPress={() => setSearchQuery('')} >
              <FontAwesome name="times" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        {/* LE BOUTON POUR QUITTER LE MODE SUPPRESSION */}
        {isDeleteMode && (
          <TouchableOpacity 
            onPress={() => setIsDeleteMode(false)} 
            style={{ padding: 10, alignSelf: 'flex-end', marginRight: 20, marginBottom: 10, backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
          >
            <Text style={{ color: '#e8be4b', fontWeight: 'bold', fontSize: 16 }}>Terminer</Text>
          </TouchableOpacity>
        )}
        {/*VUE A : SI LA COLLECTION EST VIDE*/}
        {activeFilter && (
          <View style={styles.activeFilterBanner}>
            <Text style={styles.filterText}>
              Résultats pour : {activeFilter.value} ({filtredMovies.length})
            </Text>
            <TouchableOpacity onPress={() => setActiveFilter(null)} >
              <FontAwesome name="times" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        {filtredMovies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Votre collection est encore vide...</Text>
            <Text style={styles.emptySubtitle}>Commencez à ajouter vos films préférés dès maintenant !</Text>
            <Buttons
              title="🔍 Trouver un film"
              onPress={() => navigation.navigate('Ajouter un Film')}
              variant="primary"
              style={styles.emptyButton}
            />
          </View>
        ) : (

          /*VUE B : AFFICHAGE DE LA GRILLE DE FILMS */

          <FlatList
            key={`flatlist-columns-${columns}`}
            data={filtredMovies}
            numColumns={columns}
            columnWrapperStyle={columns > 1 ? styles.row : null}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e8be4b"
              colors={['#e8be4b']}
              progressBackgroundColor="#e8be4b"
              />
            }
            renderItem={({ item }) => (


              <View style={{ position: 'relative', margin: columns > 1 ? 5 : 0 }}>
                <MovieGrid
                  mode='add'
                  titleOriginal={sortOption}
                  movie={item}
                  columns={columns}
                  cardWidth={cardWidth}
                  onPress={() => {
                    if (isDeleteMode) {
                      confirmDelete(item); 
                    } else {
                      handleOpenMovie(item);
                    }
                  }}
                  onLongPress={() => {
                    setIsDeleteMode(true);
                    setSelectedMovie(item);
                  }}
                />

                {isDeleteMode && (
                  <TouchableOpacity
                    style={styles.deleteBadge}
                    activeOpacity={0.7}
                    onPress={() => confirmDelete(item)} 
                  >
                    <FontAwesome name="times" size={14} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            )
            }
          />
        )}
        {/*MODALE PROFILE*/}
        <ProfileMenuModal
          visible={isProfileMenuVisible}
          onClose={() => setIsProfileMenuVisible(false)}
          onNavigate={(screen) => navigation.navigate(screen)}
          onLogout={() => {
             dispatch(logout());
             navigation.navigate('Home');
          }}
        />
        {/*MODALE SETTINGS*/}
        <SettingsModal
          visible={isSettingsVisible}
          onClose={() => setIsSettingsVisible(false)}
          columns={columns}
          modColumns={modColumns}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          movies={movies}
          sortOption={sortOption}
          modSort={modSort}
          sortOption2={sortOption2}
          modSort2={modSort2}
          likedActivated = {likedActivated}
          modSelectedYear = {modSelectedYear}
        />
      </View>
      {/*LA MODALE DETAIL DE FILM*/}

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        {selectedMovie && (
          <MovieCard
            mode={activeNotification ? "manage_request" : (movieOwnerId ? "friend" : "collection")}
            requester={activeNotification?.senderId}
            notificationId={activeNotification?._id}
            moviedata={selectedMovie}
            setIsModalVisible={setIsModalVisible}
            onFilterClick={(type, value) => {
              setActiveFilter({ type, value });
              setIsModalVisible(false);
            }}
            onDeleteClick={() => {
              Alert.alert(
                'Supprimer le film',
                `Êtes-vous sûr de vouloir supprimer "${selectedMovie.title_fr || selectedMovie.original_title}" de votre collection ?`,
                [
                  {
                    text: 'Annuler',
                    style: 'cancel',
                  },
                  {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                      console.log("On lance la suppression ! Token présent", !!user.token, selectedMovie?.tmdb_id);
                      try {
                        const response = await fetch(`${BACKEND_URL}/users/delete-movie`, {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            token: user.token,
                            tmdb_id: selectedMovie.tmdb_id,
                          }),
                        });
                        const data = await response.json();
                        if (data.result) {
                          setIsModalVisible(false);
                          dispatch(removedMovieFromStore(selectedMovie.tmdb_id));
                        } else {
                          console.log("Erreur lors de la suppression", data.error);
                        }
                      } catch (error) {
                        console.error(error);
                      }

                      setIsModalVisible(false); // On ferme la modale
                    }
                  }
                ]
              );
            }}

            drawStyle={false}
            clickable={false}
            navigation={navigation}
            ownerId={movieOwnerId ? movieOwnerId : ''}
            initialTab={targetTab}

          />
        )}
      </Modal>
      {/*MODALE NOTIFICATIONS*/}
      <NotificationModal
        visible={isNotificationModalVisible}
        onClose={() => setIsNotificationModalVisible(false)}
        notifications={user.notifications || []}
        onManageLoan={handleManageLoan}
        onDeleteNotification={handleDeleteNotification}
        onMarkAllAsRead={handleMarkAllAsRead}
        onManageFriendRequest={handleManageFriendRequest}
        onRemindFriend={handleRemindFriend}
        onLeaveReview={handleLeaveReview}
        onViewReview={handleViewReview}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // --- Layout Principal ---
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- Styles de l'écran vide ---
  emptyContainer: {
    padding: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 15,
    alignItems: 'center',
    width: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  emptyButton: {
    width: '100%',
  },

  // --- Styles du conteneur de la liste (FlatList) ---
  listContainer: {
    paddingHorizontal: '5%',
    paddingTop: 15,
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'flex-start',
    gap: 10,
    width: width * 0.9,
    marginBottom: 15,
  },

  //filtre

  activeFilterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 41, 66, 0.9)',
    width: '90%',
    alignSelf: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#e8be4b'
  },
  filterText: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 15,
  },
  clearFilterText: {
    color: '#ff4d4d',
    fontWeight: 'bold'
  },

  //supprimer un film longpress
  deleteBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#d9534f',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1C2942', 
    zIndex: 10,
  },
});