import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { Buttons } from '../components/buttons';
import MovieGrid from '../components/MovieGrid';
import MovieCard from '../components/movieCard';
import Poster from '../components/poster';
import SettingsModal from '../components/settingsModal';
import { removedMovieFromStore, logout } from '../reducers/user';
import { useDispatch } from 'react-redux';
import { FontAwesome } from '@expo/vector-icons';



type MyCollectionProps = {
  navigation: NavigationProp<ParamListBase>;
};

const BACKEND_URL = process.env.BACKEND_URL;

const { width } = Dimensions.get('window');

export default function MyCollection({ navigation }: MyCollectionProps) {

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [columns, setColumns] = useState(2);

  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.value);
  const movies = useSelector((state: any) => state.user.value.movies);
  useEffect(() => {
    if (!user.token) {
      navigation.navigate('Home')
    }
  }, []);

  const getCardWidth = () => {
    if (columns === 1) return '100%';
    return (width * 0.9) / columns - 10;
  };
  const cardWidth = getCardWidth();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<{ type: string, value: string } | null>(null);


  const handleOpenMovie = (movie: any) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
  };

  const handleLogout = () => {

    dispatch(logout());
    //navigation.navigate('Home');
  }
  const safeMovies = movies || [];

  const filtredMovies = safeMovies

    .filter((movie: any) => {
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
    .filter((movie: any) => {
      if (searchQuery.trim() === '') return true;
      const title = movie.title_fr || movie.original_title || '';
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });




  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <Header title="Ma Collection"
        leftIcon={<Text style={{ fontSize: 20 }}>👤</Text>}
        onPressLeft={() => console.log('Aller vers le profil')}
        onPressLogout={() => {
          dispatch(logout());
          navigation.navigate('Home');
        }}
        rightIcon={<Text style={{ fontSize: 20 }}>⚙️</Text>}
        onPressRight={() => setIsSettingsVisible(true)}
      />


      <View style={styles.container}>
        {/*Pastille de recherche actie*/}
        {searchQuery.length > 0 && (
          <View style={styles.activeFilterBanner}>
            <Text style={styles.filterText} numberOfLines={2}>
              Recherche : <Text style={{ fontWeight: 'bold' }}>{searchQuery}</Text>
            </Text>
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearFilterText}>
              <FontAwesome name="times" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        {/*VUE A : SI LA COLLECTION EST VIDE*/}
        {activeFilter && (
          <View style={styles.activeFilterBanner}>
            <Text style={styles.filterText}>
              Résultats pour : {activeFilter.value} ({filtredMovies.length})
            </Text>
            <TouchableOpacity onPress={() => setActiveFilter(null)} style={styles.clearFilterText}>
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
              console.log(item);
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
        {/*MODALE SETTINGS*/}
        <SettingsModal
          visible={isSettingsVisible}
          onClose={() => setIsSettingsVisible(false)}
          columns={columns}
          setColumns={setColumns}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          movies={filtredMovies}
        />
      </View>
      {/*LA MODALE DETAIL DE FILM*/}

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        {selectedMovie && (
          <MovieCard
            mode="collection"
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
    fontWeight: 'bold',
  },
});