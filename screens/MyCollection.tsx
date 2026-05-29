import React from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { Buttons } from '../components/buttons';

type MyCollectionProps = {
  navigation: NavigationProp<ParamListBase>;
};


const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width * 0.9) / 2 - 10; 

export default function MyCollection({ navigation }: MyCollectionProps) {
  

  const movies = useSelector((state: any) => state.user.value.movies);

  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <Header title="Ma Collection" />

      <View style={styles.container}>
        
        {/*VUE A : SI LA COLLECTION EST VIDE*/}
        {movies.length === 0 ? (
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
            data={movies}
            keyExtractor={(item, index) => item.tmdb_id ? item.tmdb_id.toString() : index.toString()}
            numColumns={2} // 👈 Force l'affichage sur 2 colonnes
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              
              const imageUrl = item.poster_path 
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
                : 'https://via.placeholder.com/500x750?text=Pas+d%27affiche';
              
              
              const year = item.release_date ? item.release_date.substring(0, 4) : '';

              return (
                <TouchableOpacity 
                  style={styles.movieCard}
                  onPress={() => console.log('Clic sur le film :', item.title_fr || item.original_title)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: imageUrl }} style={styles.poster} />
                  <View style={styles.infoContainer}>
                    <Text style={styles.movieTitle} numberOfLines={1}>
                      {item.title_fr || item.original_title}
                    </Text>
                    {year ? <Text style={styles.movieYear}>{year}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
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
  
  // Styles de l'écran vide
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
  
  // Styles de la Grille (FlatList)
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
  movieCard: {
    width: COLUMN_WIDTH,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  poster: {
    width: '100%',
    height: COLUMN_WIDTH * 1.45, // Ratio d'une affiche cinéma standard
    backgroundColor: '#1a1a1a',
  },
  infoContainer: {
    padding: 10,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  movieYear: {
    fontSize: 12,
    color: '#e8be4b', // Couleur dorée
    fontWeight: '600',
  },
});