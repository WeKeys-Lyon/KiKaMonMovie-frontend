import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Modal, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import Header from '../components/header';
import MovieGrid from '../components/MovieGrid'; // Ton composant d'affichage
import { FontAwesome } from '@expo/vector-icons';
import { Buttons } from '../components/buttons';

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

    try {
      const response = await fetch(`${BACKEND_URL}/users/ask-movie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: user.token, 
          friendId: friendId, 
          movieId: selectedMovie._id 
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
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande.');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title={`Collection de ${friendName}`} 
        leftIcon={<FontAwesome name="home" size={28} color="#e8be4b" />}
        onPressLeft={() => navigation.goBack()}
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
            data={movies}
            keyExtractor={(item, index) => item?.tmdb_id?.toString() || item?._id?.toString() || index.toString()}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={{ margin: 5 }}>
                <MovieGrid
                  movie={item}
                  columns={2}
                  cardWidth={170} 
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
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {selectedMovie && (
              <>
                {/* L'affiche du film */}
                <Image 
                  source={{ uri: selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : 'https://via.placeholder.com/500x750' }} 
                  style={styles.modalPoster} 
                />
                
                {/* Titre et Année */}
                <Text style={styles.modalTitle}>{selectedMovie.title_fr || selectedMovie.original_title}</Text>
                <Text style={styles.modalYear}>
                  {selectedMovie.release_date ? selectedMovie.release_date.substring(0, 4) : 'N/A'}
                </Text>

                {/* LES INFOS TECHNIQUES (Réalisateur, Acteurs, Compositeur) */}
                <View style={styles.detailsContainer}>
                  
                  <Text style={styles.modalLabel}>
                    Date de sortie : <Text style={styles.modalValue}>
                      {selectedMovie?.release_date ? new Date(selectedMovie.release_date).toLocaleDateString('fr-FR') : 'Inconnue'}
                    </Text>
                  </Text>

                  <Text style={styles.modalLabel}>
                    Réalisé par : <Text style={styles.modalValue}>
                      {selectedMovie?.DirectedBy?.map((d: any) => d.name).join(', ') || 'Inconnu'}
                    </Text>
                  </Text>

                  <Text style={styles.modalLabel}>
                    Genre : <Text style={styles.modalValue}>
                      {selectedMovie?.Genres?.map((g: any) => g.name).join(', ') || 'Inconnu'}
                    </Text>
                  </Text>

                  <Text style={styles.modalLabel}>
                    Compositeur : <Text style={styles.modalValue}>
                      {selectedMovie?.MusicBy?.map((m: any) => m.name).join(', ') || 'Inconnu'}
                    </Text>
                  </Text>

                  <Text style={styles.modalLabel}>
                    Casting : <Text style={styles.modalValue}>
                      {/* On limite à 5 acteurs pour ne pas surcharger la modale */}
                      {selectedMovie?.Cast?.slice(0, 5).map((a: any) => a.name).join(', ') || 'Inconnu'}
                    </Text>
                  </Text>

                </View>

                {/* Les boutons d'action */}
                <View style={styles.modalButtonsRow}>
                  <Buttons 
                    title="Retour" 
                    onPress={() => setIsModalVisible(false)} 
                    variant="secondary" 
                    style={{ flex: 1, marginRight: 10 }} 
                  />
                  <Buttons 
                    title="Demander" 
                    onPress={handleAskForMovie} 
                    variant="primary" 
                    style={{ flex: 1 }} 
                  />
                </View>
              </>
            )}

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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