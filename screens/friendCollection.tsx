import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Modal, Image, Dimensions, ImageBackground } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import Header from '../components/header';
import MovieGrid from '../components/MovieGrid';
import MovieCard from '../components/movieCard';
import SettingsModal from '../components/settingsModal';
import { FontAwesome } from '@expo/vector-icons';
import { Buttons } from '../components/buttons';

const { width } = Dimensions.get('window');

type FriendCollectionProps = {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<any, any>; 
};

const BACKEND_URL = process.env.BACKEND_URL;

export default function FriendCollection({ navigation, route }: FriendCollectionProps) {
  const user = useSelector((state: any) => state.user.value);
  const { friendId, friendName } = route.params;

  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [columns, setColumns] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('year_desc');
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
       const bulletproofMovies = data.movies.map((m: any) => m.movieid ? m.movieid : m);
        setMovies(bulletproofMovies);
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
  // 1. Filtrage par recherche
  const filteredMovies = movies.filter((movie) => {
    if (!searchQuery) return true; // Si la barre est vide, on garde tout
    
    const lowerQuery = searchQuery.toLowerCase();
    const titleFr = (movie?.title_fr || '').toLowerCase();
    const titleOriginal = (movie?.original_title || '').toLowerCase();
    const year = movie?.release_date ? movie.release_date.substring(0, 4) : '';
    
    // On vérifie si la recherche correspond au titre ou à l'année
    return titleFr.includes(lowerQuery) || titleOriginal.includes(lowerQuery) || year.includes(searchQuery);
  });

  // 2. Tri selon l'option choisie dans SettingsModal
  const filteredAndSortedMovies = filteredMovies.sort((a, b) => {
    if (sortOption === 'title_asc') {
      return (a?.title_fr || a?.original_title || '').localeCompare(b?.title_fr || b?.original_title || '');
    } else if (sortOption === 'title_desc') {
      return (b?.title_fr || b?.original_title || '').localeCompare(a?.title_fr || a?.original_title || '');
    } else if (sortOption === 'year_desc') {
      return new Date(b?.release_date || 0).getTime() - new Date(a?.release_date || 0).getTime();
    } else if (sortOption === 'year_asc') {
      return new Date(a?.release_date || 0).getTime() - new Date(b?.release_date || 0).getTime();
    }
    return 0;
  });

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
            data={filteredAndSortedMovies} 
            keyExtractor={(item, index) => item?.tmdb_id?.toString() || item?._id?.toString() || index.toString()}
            numColumns={columns}
            
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
          />
        )}
      </Modal>

      <SettingsModal
          visible={isSettingsModalVisible}
          onClose={() => setIsSettingsModalVisible(false)}
          columns={columns}
          setColumns={setColumns}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          movies={movies} 
          sortOption={sortOption}
          setSortOption={setSortOption}
      />

    </ImageBackground>
  );
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