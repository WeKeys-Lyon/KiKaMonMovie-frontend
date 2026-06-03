import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, Image, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import Header from '../components/header';
import { Buttons } from '../components/buttons';
import MovieGrid from '../components/MovieGrid';
import MovieCard from '../components/movieCard';


type MyCollectionProps = {
  navigation: NavigationProp<ParamListBase>,
};


const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width * 0.9) / 3 - 10; 

export default function MyCollection({ navigation }: MyCollectionProps) {
  const [error, setError] = useState('');
  const user = useSelector((state: any) => state.user.value);

  const BACKEND_URL = process.env.BACKEND_URL;

  const movies = useSelector((state: any) => state.user.value.movies);
  const [columns, setColumns] = useState(3);
  const getCardWidth = () => {
    if (columns === 1) return '100%';
    return (width * 0.9) / columns - 10;
  };
  const cardWidth = getCardWidth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<{type: string, value: string} | null>(null);

  const handleOpenMovie = (movie: any) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
  };

  const filtredMovies = activeFilter
    ? movies.filter(movie => {
      if (activeFilter.type === 'genre') {
        return movie.Genres.some((genre: any) => genre.name === activeFilter.value);
      } else if (activeFilter.type === 'director') {
        return movie.DirectedBy.some((director: any) => director.name === activeFilter.value);
      } else if (activeFilter.type === 'actor') {
        return movie.Cast.some((actor: any) => actor.name === activeFilter.value);
      } else if (activeFilter.type === 'composer') {
        return movie.MusicBy.some((composer: any) => composer.name === activeFilter.value);
      }
      return false;
    })
    : movies;


  

  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <Header title="Ma Collection" 
      leftIcon={<Text style={{ fontSize: 20 }}>👤</Text>} 
        onPressLeft={() => console.log('Aller vers le profil')}
      rightIcon={<Text style={{ fontSize: 20 }}>⚙️</Text>}
        onPressRight={() => console.log('Ouvrir les options')}
      />

      <View style={styles.container}>
        
        {/*VUE A : SI LA COLLECTION EST VIDE*/}
        {activeFilter && (
          <View style={styles.activeFilterBanner}>
            <Text style={styles.filterText}>
              Résultats pour : {activeFilter.value} ({filtredMovies.length})
            </Text>
            <TouchableOpacity onPress={() => setActiveFilter(null)}>
              <Text style={styles.clearFilterText}>❌ Effacer</Text>
            </TouchableOpacity>
          </View>
        )}
        {filtredMovies == undefined ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Votre collection est encore vide...</Text>
            <Text style={styles.emptySubtitle}>Commencez à ajouter vos films préférés dès maintenant !</Text>
            <Buttons 
              title="🔍 Trouver un film" 
              onPress={() => navigation.navigate('AddAMovie')} 
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
            renderItem={({ item }) => (
              
              <MovieGrid
                movie={item} 
                columns={columns} 
                cardWidth={cardWidth} 
                onPress={() => handleOpenMovie(item)}
              />
            )
            }
          />
        )}
      </View>
      {/*LA MODALE DETAIL DE FILM*/}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        {selectedMovie && (
          <MovieCard 
            mode="collection" 
            moviedata={selectedMovie} 
            setIsModalVisible={setIsModalVisible}
            onFilterClick={(type, value) => {
              setActiveFilter({type, value});
              setIsModalVisible(false);
            }}
            onLendClick={() => {
              console.log('Ouvrir la modale de prêt pour :', selectedMovie.title_fr);
            }}
            
          />
        )}
      </Modal>
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
    justifyContent: 'space-between',
    width: width * 0.9,
    marginBottom: 15,
  },
  activeFilterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C2942',
    width: '90%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#e8be4b'
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearFilterText: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
});