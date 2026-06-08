import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { Buttons } from '../components/buttons';
import { addMovieToStore } from '../reducers/user';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import Poster from '../components/poster';
import LoanModal from './loanModal';
import LoanDetailsModal from './loanDetailsModale';



type MovieCardScreenProps = {
  navigation: NavigationProp<ParamListBase>,
  clickable: boolean,
  moviedata: any,
  setIsModalVisible: any,
  drawStyle: boolean
  mode?: 'add' | 'collection' | 'friend';
  onFilterClick?: (type: string, value: string) => void;
  onDeleteClick: () => void;
  onAddSuccess?: () => void;
  onAskMovie?: () => void;
};


export default function MovieCard({ navigation, clickable, moviedata, setIsModalVisible, drawStyle, mode = 'add', onFilterClick, onDeleteClick, onAddSuccess, onAskMovie }: MovieCardScreenProps) {

  const BACKEND_URL = process.env.BACKEND_URL;

  const user = useSelector((state: any) => state.user.value);
  const dispatch = useDispatch();
  const setModalVisible = () => {
    setIsModalVisible(false)
  }
  const [datas, setDatas] = useState(moviedata)
  const [isLoanModalVisible, setIsLoanModalVisible] = useState(false);
  const [isLoanDetailsVisible, setIsLoanDetailsVisible] = useState(false);
  const currentLoan = datas?.pastLoans && datas.pastLoans.length > 0 
    ? datas.pastLoans[datas.pastLoans.length - 1] 
    : null;

  useEffect(() => {
    const init = async () => {
      if (drawStyle) {
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



   const handleAddMovie = async () => {
      const BACKEND_URL = process.env.BACKEND_URL;  
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
        
        if (data.result) {
          setIsModalVisible(false);
          datas.isLoaned = false;
          datas.isLiked = false;
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
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {displayedItems.map((item: any, index: number) => (
          <TouchableOpacity
            key={index}
            disabled={mode === 'add'}
            onPress={() => onFilterClick && onFilterClick(type, item.name)}
          >
            <Text style={[styles.modalText, { fontSize: 16, lineHeight: 24 }, mode === 'collection' && { color: '#e8be4b', textDecorationLine: 'underline' }]}>
              {item.name}{index < displayedItems.length - 1 ? ', ' : ''}
            </Text>
          </TouchableOpacity>
        ))}
        {maxItems && items.length > maxItems && (
          <Text style={[styles.modalText, { color: '#aaa', fontStyle: 'italic', fontSize: 16 }]}>
            {` (+ ${items.length - maxItems} autres)`}
          </Text>
        )}
      </View>
    );
  };

  const imageUrl = datas.poster_path ? `https://image.tmdb.org/t/p/w500${datas.poster_path}` : 'https://via.placeholder.com/500x750?text=Pas+d%27affiche';

  //aller sur la modale de prêt
  const onLendClick = () => {
    setIsLoanModalVisible(true);
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <ScrollView contentContainerStyle={styles.modalScroll} style={{ flexShrink: 1 }}>
          <View style={styles.posterContainer}>
            <Poster
              imageUrl={imageUrl}
              isLoaned={datas.isLoaned}
              columns={2} 
            />
          </View>
          {/* TODO S'il title_fr !== original_title inscrire sur une ligne en dessous original_title en plus petit et en moins clair*/}
          <Text style={styles.modalTitle}>{datas?.title_fr || datas?.original_title}</Text>

          <View style={styles.modalInfoGrid}>
            {/* TODO Faire en sorte que les genres, le cast, le compositeur, le réal soient clickables */}
            {(datas?.title_fr !== datas?.original_title) ? (<Text style={styles.modalLabel}>Titre original : <Text style={styles.modalText}>{datas?.original_title}</Text></Text>) : (<></>)}
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
                  onPress={onDeleteClick}
                  variant="primary"
                  style={{ backgroundColor: '#d9534f', width: '80%' }}
                />
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.modalButtonsRow}>
          {/* Bouton Retour (Toujours là) */}
          <View style={{ flex: 1 }}>
            <Buttons title="Retour" onPress={() => setModalVisible()} variant="primary" />
          </View>
          
          {/* Bouton d'Action dynamique selon le mode */}
          <View style={{ flex: 1 }}>
            {mode === 'add' ? (
              <Buttons title="Ajouter" onPress={handleAddMovie} variant="primary" />
            ) : mode === 'friend' ? (
              // 🤝 MODE AMI : Soit Indisponible, soit Demander
              datas?.isLoaned ? (
                <View style={{ backgroundColor: 'rgba(217, 83, 79, 0.2)', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d9534f', alignItems: 'center' }}>
                  <Text style={{ color: '#d9534f', fontWeight: 'bold' }}>Indisponible</Text>
                </View>
              ) : (
                <Buttons title="Demander" onPress={onAskMovie} variant="primary" />
              )
            ) : (
              // 🏠 MODE COLLECTION (Mon App) : Soit Détails, soit Prêter
              datas?.isLoaned ? (
                <Buttons title="Détails du prêt" onPress={() => setIsLoanDetailsVisible(true)} variant="primary" style={{ backgroundColor: '#e8be4b' }} />
              ) : (
                <Buttons title="Prêter" onPress={() => setIsLoanModalVisible(true)} variant="primary" />
              )
            )}
          </View>
        </View>
      </View>
      <LoanModal 
        visible={isLoanModalVisible}
        onClose={() => setIsLoanModalVisible(false)}
        movie={datas}
        movieTmdbId={datas?.tmdb_id}
        onSuccess={(updatedPastLoans) => setDatas({ 
            ...datas, 
            isLoaned: true, 
            pastLoans: updatedPastLoans})}
      />
      <LoanDetailsModal 
        visible={isLoanDetailsVisible}
        onClose={() => setIsLoanDetailsVisible(false)}
        movieName={datas?.title_fr || datas?.original_title || 'ce film'}
        movieTmdbId={datas?.tmdb_id}
        currentLoan={currentLoan}
        onReturnSuccess={() => setDatas({ ...datas, isLoaned: false })}
      />
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
  posterContainer: {
    width: 200,
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
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
