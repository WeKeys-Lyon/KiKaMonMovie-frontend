import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TextInput, FlatList,
  KeyboardAvoidingView, Platform, Image, Modal, ScrollView, TouchableOpacity
} from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { Buttons } from '../components/buttons';
import MovieCard  from '../components/movieCard';

type AddAMovieScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function MyCollectionScreen({ navigation }: AddAMovieScreenProps) {



  const [isSearchMode, setIsSearchMode] = useState(false);
  const [queryTitle, setQueryTitle] = useState('');
  const [queryPerson, setQueryPerson] = useState('');
  const [movieData, setMovieData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const BACKEND_URL = process.env.BACKEND_URL;




  const handleBarcodeSearch = () => {
    {/*navigation.navigate('BarecodeSearch');*/ }
    console.log("Ouverture de la page de scan");
  };

  const handleManualSearch = () => {
    setIsSearchMode(true);
    {/*navigation.navigate('ManualSearch');*/ }
    console.log("Ouverture de la page de recherche manuelle");
  };

  const cancelSearch = () => {
    setIsSearchMode(false);
    setShowResults(false);
    setQueryTitle('');
    setQueryPerson('');
    setMovieData([]);
  };

  const backToSearch = () => {
    setShowResults(false);
    setMovieData([]);
  };


  const launchSearch = async () => {
    if (!queryTitle) return;

    console.log('Recherche lancée pour :', queryTitle);

    try {
      const response = await fetch(`${BACKEND_URL}/movies/search/${queryTitle}`);
      const data = await response.json();

      if (data.result) {
        setMovieData(data.answer);
        setShowResults(true);
      } else {
        console.log("Erreur backend", data.error);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  const handleOpenModal = (movie: any) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
  };

 


  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <Header title="Ajouter un film" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

        {/* VUE 1 : LES CHOIX DE DÉPART */}
        {!isSearchMode && (
          <View style={styles.card}>
            <Text style={styles.title}>Ajouter un film</Text>
            <Text style={styles.subtitle}>
              Comment souhaitez-vous trouver le film à ajouter à votre collection ?
            </Text>

            <View style={styles.buttonContainer}>
              <Buttons title="📷 Scanner un code-barre" onPress={handleBarcodeSearch} variant="actionButton" />
              <View style={styles.spacer} />
              <Buttons title="🔍 Recherche manuelle" onPress={handleManualSearch} variant="actionButton" />
            </View>
          </View>
        )}

        {/* VUE 2 : LE MODE RECHERCHE MANUELLE */}
        {isSearchMode && !showResults && (
          <View style={styles.searchContainer}>

            {/* Box Recherche par Titre */}
            <View style={styles.searchBox}>
              <Text style={styles.titleBox}>Titre du film</Text>
              <TextInput
                placeholder="Ex: Inception..."
                placeholderTextColor="#ccc"
                value={queryTitle}
                onChangeText={setQueryTitle}
                style={styles.input}
                onSubmitEditing={launchSearch}
              />
              <View style={styles.searchButtonsRow}>
                <Buttons title="Annuler" onPress={cancelSearch} variant="primary" />
                <Buttons title="Chercher" onPress={launchSearch} variant="primary" />
              </View>
            </View>

            {/* Box Recherche par Personnalité */}
            <View style={styles.searchBox}>
              <Text style={styles.titleBox}>Rechercher par personnalité</Text>
              <TextInput
                placeholder="Ex: Clint Eastwood..."
                placeholderTextColor="#ccc"
                value={queryPerson}
                onChangeText={setQueryPerson}
                style={styles.input}
              />
              <View style={styles.searchButtonsRow}>
                <Buttons title="Annuler" onPress={cancelSearch} variant="primary" />
                <Buttons title="Chercher" onPress={() => console.log("À connecter ! ")} variant="primary" />
              </View>
            </View>
          </View>
        )}

        {/* VUE 3 : les resultats */}
        {isSearchMode && showResults && (
          <View style={styles.resultsContainer}>
            <View style={styles.backButtonContainer}>
              <Buttons title="Nouvelle recherche" onPress={backToSearch} variant="secondary" />
            </View>
            {/* Faire un type export typescript pour qu'il n'y ait pas d'erreurs */}
            <FlatList
              data={movieData}
              keyExtractor={(item, index) => item.tmdb_id ? item.tmdb_id.toString() : index.toString()}
              style={styles.list}
              renderItem={({ item }) => {
                const imageUrl = item.poster_path
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : 'https://via.placeholder.com/500x750?text=Pas+d%27affiche';
                const year = item.release_date ? item.release_date.substring(0, 4) : 'N/A';
                const director = item.DirectedBy && item.DirectedBy.length > 0
                  ? item.DirectedBy[0].name
                  : 'Réalisateur inconnu';

                return (
                  <TouchableOpacity onPress={() => handleOpenModal(item)}>
                    <View style={styles.movieCard}>
                      <Image source={{ uri: imageUrl }} style={styles.poster} />
                      <View style={styles.movieInfo}>
                      {/* TODO S'il title_fr !== original_title inscrire sur une ligne en dessous original_title en plus petit et en moins clair*/}
                        <Text style={styles.movieTitle} numberOfLines={2}>
                          {item.title_fr || item.original_title}
                        </Text>
                        <Text style={styles.movieYear}>{year}</Text>
                        <Text style={styles.movieDirector}>{director}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}
        {/* modale */}
        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <MovieCard navigation={navigation} clickable={false} moviedata={selectedMovie} setIsModalVisible={() => setIsModalVisible(false)}/>
        </Modal>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Vue 1
  card: { marginHorizontal: 20, padding: 30, backgroundColor: 'rgba(0, 0, 0, 0.75)', borderRadius: 15, alignItems: 'center', width: '90%' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 15, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#ddd', textAlign: 'center', marginBottom: 35, lineHeight: 22 },
  buttonContainer: { width: '100%', alignItems: 'center' },
  actionButton: { width: '100%' },
  spacer: { height: 15 },

  // Vue 2
  searchContainer: { flex: 1, width: '100%', paddingTop: 20, alignItems: 'center' },
  titleBox: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'left', width: '100%' },
  searchBox: { width: '90%', backgroundColor: 'rgba(0, 0, 0, 0.75)', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  input: { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 8, paddingHorizontal: 15, height: 50, color: '#fff', marginBottom: 15, fontSize: 16 },
  searchButtonsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '60%', gap: 20 },
  smallButton: { flex: 1 },

  // FlatList (Résultats de recherche)
  list: { width: '90%', flex: 1 },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: '#333',
  },
  movieInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  movieYear: {
    fontSize: 14,
    color: '#e8be4b',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  movieDirector: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
  resultsContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
  },
  backButtonContainer: {
    width: '90%',
    marginBottom: 15,
  },
  
});
