import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, FlatList } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { Buttons } from '../components/buttons';

type AddAMovieScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function MyCollectionScreen({ navigation }: AddAMovieScreenProps) {

  const [isSearchMode, setIsSearchMode] = useState(false);
  const [query, setQuery] = useState('');
  const [movieData, setMovieData] = useState([]);


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
    setQuery('');
    setMovieData([]);
  };

  const launchSearch = async () => {
    if (!query) {
      return;
    }
    console.log('recherche lancée', query)
  };



  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <Header title="Ajouter un film" />

      <View style={styles.container}>
        {/* VUE 1 : LES CHOIX DE DÉPART */}
        {!isSearchMode && (
          <View style={styles.card}>
            <Text style={styles.title}>Ajouter un film</Text>
            <Text style={styles.subtitle}>
              Comment souhaitez-vous trouver le film à ajouter à votre collection ?
            </Text>

            <View style={styles.buttonContainer}>
              <Buttons
                title="📷 Scanner un code-barre"
                onPress={handleBarcodeSearch}
                variant='actionButton'
              />

              <View style={styles.spacer} />

              <Buttons
                title="🔍 Recherche manuelle"
                onPress={handleManualSearch}
                variant='actionButton'
              />
            </View>
          </View>
        )}
        {/*VUE 2 : LE MODE RECHERCHE MANUELLE*/}
        {isSearchMode && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Text style={styles.titleBox}>Titre du film</Text>
              <TextInput
                placeholder="Ex: Inception, Le Parrain..."
                placeholderTextColor="#ccc"
                value={query}
                onChangeText={setQuery}
                style={styles.input}
                autoFocus={true} 
                onSubmitEditing={launchSearch} 
              />
              <View style={styles.searchButtonsRow}>
                <Buttons title="Annuler" onPress={cancelSearch} variant='actionButton' />
                <Buttons title="Chercher" onPress={launchSearch} variant='actionButton' />
              </View>
            </View>
            <View style={styles.searchBox}>
              <Text style={styles.titleBox}>Rechercher par personnalité</Text>
              <TextInput
                placeholder="Ex: Clint Eastwood, Quentin Tarantino..."
                placeholderTextColor="#ccc"
                value={query}
                onChangeText={setQuery}
                style={styles.input}
                autoFocus={true} 
                onSubmitEditing={launchSearch} 
              />
              <View style={styles.searchButtonsRow}>
                <Buttons title="Annuler" onPress={cancelSearch} variant='actionButton' />
                <Buttons title="Chercher" onPress={launchSearch} variant='actionButton' />
              </View>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  // Styles de la vue 1
  card: {
    marginHorizontal: 20, padding: 30, backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 15, alignItems: 'center', width: '90%',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 15, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#ddd', textAlign: 'center', marginBottom: 35, lineHeight: 22 },
  buttonContainer: { width: '100%', alignItems: 'center' },
  actionButton: { width: '100%' },
  spacer: { height: 15 },

  // Styles de la vue 2 (Recherche)
  searchContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 20,
    alignItems: 'center',
  },
  titleBox: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'left',
  },
  searchBox: {
    width: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    color: '#fff',
    marginBottom: 15,
    fontSize: 16,
  },
  searchButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
    gap: 20,
  },
  smallButton: {
    flex: 1,
  }
});
