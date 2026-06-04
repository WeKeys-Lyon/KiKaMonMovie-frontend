import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { Buttons } from '../components/buttons';
import { addMovieToStore } from '../reducers/user';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import LoanModal from '../components/loanModal';


type MovieCardScreenProps = {
  navigation: NavigationProp<ParamListBase>,
  clickable: boolean,
  moviedata: any,
  setIsModalVisible: any,
  drawStyle: boolean
  mode?: 'add' | 'collection';
  onFilterClick?: (type: string, value: string) => void;
  onDeleteClick?: () => void;
  onAddSuccess?: () => void;
};


export default function MovieCard({ navigation, clickable, moviedata, setIsModalVisible, drawStyle, mode = 'add', onFilterClick, onDeleteClick, onAddSuccess }: MovieCardScreenProps) {

    const BACKEND_URL = process.env.BACKEND_URL;

    const user = useSelector((state: any) => state.user.value);
    const dispatch = useDispatch();
    const setModalVisible = () => {
      setIsModalVisible(false)
    }
    const [datas, setDatas] = useState(moviedata)
    const [isLoanModal, setLoanModal] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
                if (drawStyle){
                const myURL = `${BACKEND_URL}/movies/searchid/${moviedata.tmdb_id}`
                const response = await fetch(encodeURI(myURL));
                const data = await response.json();
                if (data.result) {
                  setDatas(data.answer);
                }
                }
        }
        init()
    }, [])
     
  const handleLoanReturn = () => {
    (isLoanModal) ? setLoanModal(false) : setLoanModal(true);
  }

   const handleAddMovie = async () => {
      const BACKEND_URL = process.env.BACKEND_URL;
      console.log(datas?.title_fr || datas?.original_title)
  
      try {
        const response = await fetch(`${BACKEND_URL}/users/add-movie`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: user.token,
            movie: datas,
          }),
        });
  
        const data = await response.json();
        console.log(data)
        if (data.result) {
          setIsModalVisible(false);
          dispatch(addMovieToStore(datas));
          if (onAddSuccess) onAddSuccess();
          navigation.navigate('TabNavigator', { screen: 'MyCollection' });
        } else {
          console.log("Erreur lors de l'ajout", data.error);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const renderClickableNames = (items: any[], type: string, maxItems?: number) => {
      if (!items || items.length === 0) return <Text style={styles.modalText}>Inconnu</Text>;
      const displayedItems = maxItems ? items.slice(0, maxItems) : items;
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10}}>
          {displayedItems.map((item: any, index: number) => (
          <TouchableOpacity 
            key={index} 
            disabled={mode === 'add'} 
            onPress={() => onFilterClick && onFilterClick(type, item.name)}
          >
            <Text style={[styles.modalText, {fontSize: 16, lineHeight: 24}, mode === 'collection' && { color: '#e8be4b', textDecorationLine: 'underline' }]}>
              {item.name}{index < displayedItems.length - 1 ? ', ' : ''}
            </Text>
          </TouchableOpacity>
        ))}
        {maxItems && items.length > maxItems && (
          <Text style={[styles.modalText, { color: '#aaa', fontStyle: 'italic', fontSize: 16}]}>
            {` (+ ${items.length - maxItems} autres)`}
          </Text>
        )}
        </View>
      );
    };

    return (
        <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <ScrollView contentContainerStyle={styles.modalScroll} style={{ flexShrink: 1 }}>
                        <Image
                          source={datas?.poster_path ? { uri: `https://image.tmdb.org/t/p/w500${datas.poster_path}`} : require('../assets/nomovie.jpg')}
                          style={styles.modalPoster}
                        />
                        {/* TODO S'il title_fr !== original_title inscrire sur une ligne en dessous original_title en plus petit et en moins clair*/}
                        <Text style={styles.modalTitle}>{datas?.title_fr || datas?.original_title}</Text>
        
                        <View style={styles.modalInfoGrid}>
                          {/* TODO Faire en sorte que les genres, le cast, le compositeur, le réal soient clickables */}
                          <Text style={styles.modalLabel}>Date de sortie : <Text style={styles.modalText}>{datas?.release_date}</Text></Text>
                          <Text style={styles.modalLabel}>Réalisé par :</Text>
                          {renderClickableNames(datas?.DirectedBy, 'director')}
                          <Text style={styles.modalLabel}>Genre :</Text>
                          {renderClickableNames(datas?.Genres, 'genre')}
                          <Text style={styles.modalLabel}>Compositeur : </Text>
                          {renderClickableNames(datas?.MusicBy, 'composer')}
                          
                          <Text style={styles.modalLabel}>Casting :</Text>
                          {renderClickableNames(datas?.Cast, 'actor', 15)}
                          {mode === 'collection' && (
                          <View style={{ marginTop: 15, width: '100%', alignItems: 'center' }}>
                            <Buttons 
                              title="🗑️ Supprimer le film" 
                              onPress={() => onDeleteClick} 
                              variant="primary" 
                              style={{ backgroundColor: '#d9534f', width: '80%' }} 
                            />
                          </View>  
                          )}
                        </View>
                      </ScrollView>
        
                      <View style={styles.modalButtonsRow}>
                        {/* TODO jouer sur le CSS des boutons, ils se touchent actuellement */}
                        <View style={{ flex: 1 }}>
                          <Buttons title="Retour" onPress={() => setModalVisible()} variant="primary" />
                        </View>
                        <View style={{ flex: 1 }}>
                          {mode === 'add' ? (
                          <Buttons title="Ajouter" onPress={handleAddMovie} variant="primary" />
                          ) : (
                          <Buttons title="Prêter" onPress={() => handleLoanReturn()} variant="primary" />
                          )}
                        </View>
                      </View>
                    </View>
                    {isLoanModal && (<>
                          <LoanModal movieName={moviedata.title_fr} handleLoanReturn={() => handleLoanReturn()}/>
                          </>)}
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
    fontSize: 18,
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
    gap: 10,
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
