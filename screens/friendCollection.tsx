import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Modal, Dimensions, ImageBackground, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import Header from '../components/header';
import MovieGrid from '../components/MovieGrid';
import MovieCard from '../components/movieCard';
import SettingsModal from '../components/settingsModal';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { User, movieProps } from '../components/types';

const { width } = Dimensions.get('window');

type FriendCollectionProps = {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<any, any>; 
};

const BACKEND_URL = process.env.BACKEND_URL;

export default function FriendCollection({ navigation, route }: FriendCollectionProps) {
if (typeof(route.params) == 'object') {
  const user = useSelector((state: {_persist: any, user: {value: User}}) => state.user.value);
  const { friendId, friendName } = route.params;
  
  const [movies, setMovies] = useState<movieProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [columns, setColumns] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{ type: string, value: string } | null>(null);
  const [sortOption, setSortOption] = useState<string>(user.sort ? user.sort : 'title_asc');
  const [sortOption2, setSortOption2] = useState<string>('');
  const [likedActivated, setLikedActivated] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(0);

  useEffect(() => {
    fetchFriendCollection();
  }, []);

  const fetchFriendCollection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/users/friend-collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: user.token, friendId: friendId }),
      });
      const data = await response.json();

      if (data.result) {
       //const bulletproofMovies = data.movies.map((m: movieProps[]) => m._id ? m._id : m);
        setMovies(data.movies);
      } else {
        if (data.error && data.error.includes('restreint')) {
          setAccessDenied(true);
        } else {
          Alert.alert('Erreur', data.error);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la collection.');
    } finally {
      setIsLoading(false);
    }
  };
 const modColumns = (number: number) => {
    setColumns(number);
  }
  
  const modSort = (string: string) => {
    setSortOption(string);
  }
  const modSort2 = (string: string) => {
    setSortOption2(string);
    setLikedActivated(!likedActivated)
  }
  const modSelectedYear = (number: number) => {
    setSelectedYear(number);
  }
  //demander à emprunter un film:
  const handleAskForMovie = async () => {

    if (!selectedMovie) return;

    
    console.log("Tentative d'emprunt. Voici l'objet du film :", selectedMovie.title_fr);
    console.log("L'ID envoyé est :", selectedMovie.tmdb_id || selectedMovie.id);

    try {
      const response = await fetch(`${BACKEND_URL}/users/ask-movie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: user.token, 
          friendId: friendId, 
          // 🛡️ DOUBLE SÉCURITÉ : On cherche tmdb_id, et sinon on tente id
          tmdb_id: selectedMovie.tmdb_id || selectedMovie.id 
        }),
      });
      
      const data = await response.json();

      if (data.result) {
        Alert.alert('Succès !', data.message);
        setIsModalVisible(false);
      } else {
        Alert.alert('Oups', data.error);
      }
    } catch (error) {
      console.log("Erreur catch frontend:", error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande.');
    }
  };

  const safeMovies = movies || [];
  // 1. Filtrage par recherche
  const filteredMovies = safeMovies
    // 1. LE FILTRE PAR CATÉGORIE (Genre, Réalisateur, etc.)
    .filter((movie) => {
      if (!activeFilter) return true;

      if (activeFilter.type === 'genre') {
        return movie.Genres?.some((genre: { name: string; }) => genre.name === activeFilter.value);
      } else if (activeFilter.type === 'director') {
        return movie.DirectedBy?.some((director: { name: string; }) => director.name === activeFilter.value);
      } else if (activeFilter.type === 'actor') {
        return movie.Cast?.some((actor: { name: string; }) => actor.name === activeFilter.value);
      } else if (activeFilter.type === 'composer') {
        return movie.MusicBy?.some((composer: { name: string; }) => composer.name === activeFilter.value);
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


  const onRefresh = useCallback(async () => {
    setRefreshing(true); // Fait apparaître la roue jaune
    try {
      // On réutilise simplement ta fonction existante !
      await fetchFriendCollection();
    } catch (error) {
      console.error("Erreur lors du rafraîchissement ami :", error);
    } finally {
      setRefreshing(false); // Cache la roue jaune
    }
  }, [user.token, friendId]);

  
  
return (
    <ImageBackground source={require('../assets/arriereplan.png')} style={styles.background}>
      <Header 
        title={`Collection de ${friendName}`} 
        leftIcon={<FontAwesome name="home" size={24} color="#e8be4b" />}
        onPressLeft={() => navigation.goBack()}
        rightIcon={<FontAwesome name="cog" size={24} color="#e8be4b" />}
        onPressRight={() => setIsSettingsModalVisible(true)}
      />

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#e8be4b" />
        </View>
      ) : accessDenied ? (
        <View style={styles.centerBox}>
          <FontAwesome name="lock" size={60} color="#d9534f" style={{ marginBottom: 20 }} />
          <Text style={styles.errorText}>{friendName} a rendu sa collection privée.</Text>
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>La collection de {friendName} est vide.</Text>
        </View>
      ) : (
        <View style={{ flex: 1, padding: 10 }}>
          <FlatList
            key={columns} 
            data={filteredMovies} 
            keyExtractor={(item, index) => item?.tmdb_id?.toString() || index.toString()}
            numColumns={columns}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor="#e8be4b" 
                colors={["#e8be4b"]} 
              />
            }
            
            columnWrapperStyle={columns > 1 ? {
              justifyContent: 'flex-start',
              gap: 10,
              width: width * 0.9,
              marginBottom: 15,
            } : undefined}
            
            contentContainerStyle={{
              paddingHorizontal: '5%',
              paddingTop: 15,
              paddingBottom: 30,
              alignItems: 'center' 
            }}
            
            showsVerticalScrollIndicator={false} 
            
            renderItem={({ item }) => (

              <View style={{ margin: columns > 1 ? 5 : 0 }}>
                <MovieGrid
                  movie={item}
                  columns={columns}
                  mode="friend"
                  cardWidth={columns === 1 ? '90%' : columns === 2 ? 170 : 110} 
                  onPress={() => {
                    setSelectedMovie(item);
                    setIsModalVisible(true);
                  }}
                />
              </View>
            )}
          />
        </View>
      )}


      {/* 🎬 LA MODALE DU FILM */}

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        {selectedMovie && (
          <MovieCard
            mode="friend"
            moviedata={selectedMovie}
            setIsModalVisible={setIsModalVisible}
            drawStyle={false} 
            clickable={false}
            navigation={navigation}
            onAskMovie={handleAskForMovie} 
            ownerId={friendId}
          />
        )}
      </Modal>

      <SettingsModal
          visible={isSettingsModalVisible}
          onClose={() => setIsSettingsModalVisible(false)}
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

    </ImageBackground>
  );
}
}
const styles = StyleSheet.create({
   background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: { flex: 1, backgroundColor: '#1C2942' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#d9534f', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  emptyText: { color: '#aaa', fontSize: 16, fontStyle: 'italic' },
  // Styles Modale
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    width: '85%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8be4b',
  },
  modalPoster: {
    width: 150,
    height: 225,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalTitle: {
    color: '#e8be4b',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalYear: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 15,
  },
  modalSynopsis: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'justify',
    marginBottom: 25,
    lineHeight: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalLabel: {
    color: '#e8be4b', 
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  modalValue: {
    color: '#fff', 
    fontWeight: 'normal',
  },
});