import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import MovieCard from '../components/movieCard';
import SelectionMenu from '../components/selectionMenu';
import ManualSearch from '../components/manualSearch';
import SearchResults from '../components/searchResults';
import BarcodeScanner from '../components/barcodeScanner';
import { useSelector } from 'react-redux';
import { useCameraPermissions } from 'expo-camera';
import { movieProps } from '../components/types';
import { truncate } from 'node:fs';


type AddAMovieScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function MyCollectionScreen({ navigation }: AddAMovieScreenProps) {



  const [isSearchMode, setIsSearchMode] = useState(false);
  const [queryTitle, setQueryTitle] = useState('');
  const [queryPerson, setQueryPerson] = useState('');
  const [queryAsked, setQueryAsked] = useState('');
  const [movieData, setMovieData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<movieProps | null>(null);
  const [drawStyle, setDrawStyle] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedTitle, setScannedTitle] = useState<string | null>(null);
  const [searchOrigin, setSearchOrigin] = useState('manual');
  const [error, setError] = useState<string>('')
  const [error2, setError2] = useState<string>('')

  const BACKEND_URL = process.env.BACKEND_URL;

  const cancelSearch = () => {
    setIsSearchMode(false);
    setShowResults(false);
    setQueryTitle('');
    setQueryPerson('');
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
        setDrawStyle(false);
        setQueryAsked(queryTitle);
        setSearchOrigin('manual');
      } else {
        setError(data.error)
        console.log("Erreur backend", data.error);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  const launchSearchPeople = async () => {

    if (!queryPerson) return;

    console.log('Recherche de personnalité lancée pour :', queryPerson);

    try {

      const response = await fetch(`${BACKEND_URL}/movies/searchpeople/${queryPerson}`);
      const data = await response.json();

      if (data.result) {
        setMovieData(data.answer);
        setShowResults(true);
        setDrawStyle(true);
        setQueryAsked(data.people)
      } else {
        setError2(data.error)
        console.log("Erreur backend", data.error);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  const handleOpenModal = (movie : movieProps) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
  };

  const clearSearch = () => {
    setQueryTitle('');
    setQueryPerson('');
    setMovieData([]);
    setShowResults(false);
    setIsSearchMode(false);
  };

  //Gestion de la camera: 
  const handleBarCodeScanned = async ({ type, data }: { type: String, data: string }) => {
    console.log("code barre détecté", data, "de type", type)
    if (!isScanning) return;
    setIsScanning(false);
    console.log(`code barre: ${data}`)

    try {
      const response = await fetch(`${BACKEND_URL}/movies/searchean/${data}`);
      const json = await response.json();

      if (json.result && json.answer) {
        setScannedTitle(json.answer);
      } else {
        Alert.alert("Mince !", json.error || "Aucun film trouvé pour ce code-barres.");
        setIsScanning(true);
      }
    } catch (error) {
      console.error(error);
      setIsScanning(true);
    }
  };

  // bouton relancer scan
  const handleRescan = () => {
    setScannedTitle(null);
    setIsScanning(true);
  }

  //bouton ajouter, rechercher sur tmdb et ouvrir la modale
  const handleConfirmScannedMovie = async (titleToSearch: string) => {
    console.log("👉 Bouton Ajouter cliqué ! Titre REÇU :", titleToSearch);

    if (!titleToSearch) return;

    try {
      let cleanTitle = titleToSearch;
      if (cleanTitle.includes('-')) {
        cleanTitle = cleanTitle.split('-')[0]; 
      }

      cleanTitle = cleanTitle.replace(/dvd|blu-ray|bleu-ray|bluray|achat|pas cher|ean|cd|édition|edition|collector|neuf|occasion|dvdfr/gi, '');
      
      cleanTitle = cleanTitle.replace(/[\[\]\(\)]/g, '');
      
      
      cleanTitle = cleanTitle.trim();

      console.log("Titre nettoyé envoyé à TMDB :", cleanTitle);

      const safeUrlTitle = encodeURIComponent(cleanTitle);

      // 3. LE FETCH
      const response = await fetch(`${BACKEND_URL}/movies/search/${safeUrlTitle}`);
      const data = await response.json();

      if (data.result && data.answer.length > 0) {
        
        // 1. On injecte toute la liste de films dans ton state 'movieData'
        setMovieData(data.answer);
        
        // 2. On met à jour le titre recherché (pour que ton composant l'affiche)
        setQueryAsked(titleToSearch); 
        setSearchOrigin('barcode');
        
        // 3. On active les "interrupteurs" pour afficher ta VUE 3
        setIsSearchMode(true);
        setShowResults(true);
        
        // 4. On ferme la caméra et on la réinitialise en arrière-plan
        setIsCameraActive(false);
        handleRescan();

      } else {
        Alert.alert("Film introuvable", `Le service de TheMovieDataBase n'a pas reconnu : "${cleanTitle}"`);
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation :", error);
      Alert.alert("Erreur", "Le serveur a rencontré un problème avec ce titre.");
    }
  };

  const handlebackToSearch = () => {
    setQueryTitle('');
    setQueryPerson('');
    setShowResults(false); 
    if (searchOrigin === 'barcode') {
        setIsSearchMode(false);
        setIsCameraActive(true);
      } else {
        setIsSearchMode(true);
    }
    handleRescan();
  };


  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <Header title="Ajouter un film" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

        {/* VUE 1 : LES CHOIX DE DÉPART */}
        {!isSearchMode && !isCameraActive && (
          <SelectionMenu
            onOpenScanner={async () => {
              if (!permission?.granted) await requestPermission();
              setIsCameraActive(true);
            }}
            onOpenSearch={() => setIsSearchMode(true)}
          />
        )}

        {/* VUE 2.1 : La camera */}
        {isCameraActive && permission?.granted && (
          <BarcodeScanner
            onRescan={handleRescan}
            onConfirm={handleConfirmScannedMovie}
            onClose={() => {
              setIsCameraActive(false);
              handleRescan();
            }}
          />
        )}

        {/* VUE 2.2 : LE MODE RECHERCHE MANUELLE */}
        {isSearchMode && !showResults && (
          <View style={{flex:1, justifyContent: 'center', alignItems: 'center', width: '100%'}}>
          <Text style={[styles.text, {textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 1, marginBottom: 50, marginTop: 0}]}>Veuillez rechercher un film en indiquant son titre exact (titre original ou français){"\n"} ou bien en indicant le nom d'une personnalité ayant participé au film. </Text>
          <ManualSearch
            queryTitle={queryTitle}
            setQueryTitle={setQueryTitle}
            queryPerson={queryPerson}
            setQueryPerson={setQueryPerson}
            launchSearchTitle={launchSearch}
            launchSearchPeople={launchSearchPeople}
            cancelSearch={cancelSearch}
            error={error}
            error2={error2}
          />
          </View>
        )}

        {/* VUE 3 : LES RÉSULTATS DE RECHERCHE */}
        {isSearchMode && showResults && (
          <SearchResults
            navigation={navigation}
            movieData={movieData}
            queryAsked={queryAsked}
            drawStyle={drawStyle}
            backToSearch={handlebackToSearch}
            handleOpenModal={handleOpenModal}
          />
        )}


        {/* modale */}
        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          {(selectedMovie) ? (<MovieCard navigation={navigation} clickable={false} moviedata={selectedMovie} setIsModalVisible={setIsModalVisible} drawStyle={drawStyle} mode="add" onAddSuccess={clearSearch} />) : (<></>)}          
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
  text: { color: '#fff', textAlign: 'center', marginTop: 15, fontSize: 20 },
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
  movieVOTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d2d2d2ff',
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
  // --- STYLES CAMERA ---
  cameraContainer: {
    width: '90%',
    height: '60%', // Ajuste selon la taille que tu souhaites
    borderRadius: 20,
    overflow: 'hidden', // Empêche la caméra de dépasser des bords arrondis
    borderWidth: 2,
    borderColor: '#e8be4b',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end', // Aligne l'overlay vers le bas
  },
  closeCameraButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  scanOverlay: {
    width: '100%',
    backgroundColor: 'rgba(28, 41, 66, 0.95)',
    padding: 20,
    borderTopWidth: 2,
    borderColor: '#e8be4b',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  overlayButtons: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    width: '100%',
  },

});
