import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Buttons } from '../components/buttons';
import { addMovieToStore } from '../reducers/user';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useEffect } from 'react';

type MovieCardScreenProps = {
  navigation: NavigationProp<ParamListBase>,
  clickable: boolean,
  moviedata: any,
  setIsModalVisible: any,
  drawStyle: boolean
};


export default function MovieCard({ navigation, clickable, moviedata, setIsModalVisible, drawStyle }: MovieCardScreenProps) {
    const BACKEND_URL = process.env.BACKEND_URL;

    const user = useSelector((state: any) => state.user.value);
    const dispatch = useDispatch();
    const setModalVisible = () => {
      setIsModalVisible(false)
    }

/*     useEffect(() => {
      async () => {
        if (drawStyle) {
          const myURL = `${BACKEND_URL}/movie/`
      }
      }

    }, []) */
   const handleAddMovie = async () => {
      const BACKEND_URL = process.env.BACKEND_URL;
  
      try {
        const response = await fetch(`${BACKEND_URL}/users/add-movie`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: user.token,
            movie: moviedata,
          }),
        });
  
        const data = await response.json();
        if (data.result) {
          setIsModalVisible(false);
          dispatch(addMovieToStore(moviedata));
          navigation.navigate('MyCollection' );
        } else {
          console.log("Erreur lors de l'ajout", data.error);
        }
      } catch (error) {
        console.error(error);
      }
    };

    return (
        <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <ScrollView contentContainerStyle={styles.modalScroll} style={{ flexShrink: 1 }}>
        
                        <Image
                          source={{ uri: moviedata?.poster_path ? `https://image.tmdb.org/t/p/w500${moviedata.poster_path}` : 'https://via.placeholder.com/500' }}
                          style={styles.modalPoster}
                        />
                        {/* TODO S'il title_fr !== original_title inscrire sur une ligne en dessous original_title en plus petit et en moins clair*/}
                        <Text style={styles.modalTitle}>{moviedata?.title_fr || moviedata?.original_title}</Text>
        
                        <View style={styles.modalInfoGrid}>
                          {/* TODO Faire en sorte que les genres, le cast, le compositeur, le réal soient clickables */}
                          <Text style={styles.modalLabel}>Date de sortie : <Text style={styles.modalText}>{moviedata?.release_date}</Text></Text>
                          <Text style={styles.modalLabel}>Réalisé par : <Text style={styles.modalText}>{moviedata?.DirectedBy?.map((d: any) => d.name).join(', ')}</Text></Text>
                          <Text style={styles.modalLabel}>Genres : <Text style={styles.modalText}>{moviedata?.genre?.map((g: any) => g.name).join(', ')}</Text></Text>
                          {/* TODO Ajouter le compositeur*/}
                          {/* TODO faire afficher moins d'acteurs, faire un affichage plus aérer pour pouvoir cliquer sur le bon acteur*/}
                          <Text style={styles.modalLabel}>Casting : <Text style={styles.modalText} numberOfLines={3}>{moviedata?.Cast?.map((c: any) => c.name).join(', ')}</Text></Text>
                        </View>
                      </ScrollView>
        
                      <View style={styles.modalButtonsRow}>
                        {/* TODO jouer sur le CSS des boutons, ils se touchent actuellement */}
                        <View style={{ flex: 1 }}>
                          <Buttons title="Retour" onPress={() => setModalVisible()} variant="primary" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Buttons title="Ajouter" onPress={handleAddMovie} variant="primary" />
                        </View>
                      </View>
                    </View>
                  </View>
    );
}

const styles = StyleSheet.create({
   // Styles de la Modale
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8be4b',
  },
  modalScroll: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  modalPoster: {
    width: 200,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalInfoGrid: {
    width: '100%',
    marginBottom: 25,
  },
  modalLabel: {
    color: '#e8be4b',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  modalText: {
    color: '#fff',
    fontWeight: 'normal',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
