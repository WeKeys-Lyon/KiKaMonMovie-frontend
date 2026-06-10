import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, ImageBackground } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationProp, ParamListBase, useIsFocused } from '@react-navigation/native';
import Header from '../components/header';
import MovieGrid from '../components/MovieGrid'; // Vérifie que le chemin est correct selon ton arborescence
import { FontAwesome } from '@expo/vector-icons';

type MySharesProps = {
  navigation: NavigationProp<ParamListBase>;
};

const BACKEND_URL = process.env.BACKEND_URL;
const { width } = Dimensions.get('window');

export default function MyShares({ navigation }: MySharesProps) {
  const user = useSelector((state: any) => state.user.value);
  const isFocused = useIsFocused(); // Permet de recharger quand on revient sur l'écran

  // Variables d'état
  const [allShares, setAllShares] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Le filtre actif ('all', 'loaned', ou 'borrowed')
  const [activeFilter, setActiveFilter] = useState<'all' | 'loaned' | 'borrowed'>('all');

  // Récupération des données
  useEffect(() => {
    if (isFocused) {
      fetchMyShares();
    }
  }, [isFocused]);

  const fetchMyShares = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/users/my-shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: user.token }),
      });
      const data = await response.json();
      
      if (data.result) {
        setAllShares(data.shares);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des partages :", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrage de la liste selon le bouton sélectionné
  const filteredShares = allShares.filter(movie => {
    if (activeFilter === 'all') return true;
    return movie.shareType === activeFilter;
  });

  // Configuration de la grille (3 colonnes pour l'exemple)
  const numColumns = 3;
  const cardWidth = (width - 40 - (numColumns - 1) * 10) / numColumns; // Calcul dynamique de la largeur

  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <Header 
        title="Mes Partages" 
        leftIcon={<FontAwesome name="home" size={28} color="#e8be4b" />}
        onPressLeft={() => navigation.goBack()} // Ou navigation.navigate('Home') selon ta nav
      />

      {/* --- LES BOUTONS DE FILTRE --- */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>Tous</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'loaned' && styles.activeFilter]}
          onPress={() => setActiveFilter('loaned')}
        >
          <Text style={[styles.filterText, activeFilter === 'loaned' && styles.activeFilterText]}>Prêtés</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'borrowed' && styles.activeFilter]}
          onPress={() => setActiveFilter('borrowed')}
        >
          <Text style={[styles.filterText, activeFilter === 'borrowed' && styles.activeFilterText]}>Empruntés</Text>
        </TouchableOpacity>
      </View>

      {/* --- L'AFFICHAGE DES FILMS --- */}
      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#e8be4b" />
        </View>
      ) : filteredShares.length === 0 ? (
        <View style={styles.centerContent}>
          <FontAwesome name="film" size={50} color="#555" style={{ marginBottom: 15 }} />
          <Text style={styles.emptyText}>Aucun film partagé pour le moment.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredShares}
          keyExtractor={(item, index) => index.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={{ gap: 10, marginBottom: 15 }}
          renderItem={({ item }) => (
            <MovieGrid 
              movie={item} 
              columns={numColumns} 
              cardWidth={cardWidth} 
              titleOriginal="title_fr" // Ou la variable que tu utilises par défaut
              onPress={() => {
                // On navigue vers la MovieCard en passant le film ET le contexte de partage
                navigation.navigate('MovieCard', { 
                  movie: item, 
                  context: 'myshares', // Très utile pour adapter la MovieCard plus tard !
                  shareType: item.shareType,
                  ownerName: item.ownerName // Pour afficher "Propriétaire: Machin"
                });
              }} 
            />
          )}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
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
  
  // Filtres
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232, 190, 75, 0.3)',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#555',
  },
  activeFilter: {
    backgroundColor: 'rgba(232, 190, 75, 0.2)',
    borderColor: '#e8be4b',
  },
  filterText: {
    color: '#aaa',
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: '#e8be4b',
  },

  // Grille et contenu
  gridContainer: {
    padding: 20,
    paddingBottom: 50, // Espace pour le scroll
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});