import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { Buttons } from '../components/buttons';
import MovieCard from '../components/MovieCard';


type MyCollectionProps = {
  navigation: NavigationProp<ParamListBase>;
};


const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width * 0.9) / 3 - 10; 

export default function MyCollection({ navigation }: MyCollectionProps) {
  
  const movies = useSelector((state: any) => state.user.value.movies);
  const [columns, setColumns] = useState(3);
  const getCardWidth = () => {
    if (columns === 1) return '100%';
    return (width * 0.9) / columns - 10;
  };
  const cardWidth = getCardWidth();

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
            key={`flatlist-columns-${columns}`} 
            data={movies}
            numColumns={columns}
            columnWrapperStyle={columns > 1 ? styles.row : null}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              
              <MovieCard 
                movie={item} 
                columns={columns} 
                cardWidth={cardWidth} 
                onPress={() => console.log('Clic sur le film :', item.title_fr || item.original_title)}
              />
            )
            }
          />
        )}
      </View>
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
});