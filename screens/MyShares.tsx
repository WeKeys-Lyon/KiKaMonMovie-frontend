import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, ImageBackground, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationProp, ParamListBase, useIsFocused } from '@react-navigation/native';
import Header from '../components/header';
import ShareGrid from '../components/shareGrid';
import LoanDetailsModal from '../components/loanDetailsModale';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setMovieReturned } from '../reducers/user';
import { User } from '../components/types';

type MySharesProps = {
  navigation: NavigationProp<ParamListBase>;
};

const BACKEND_URL = process.env.BACKEND_URL;
const { width } = Dimensions.get('window');

export default function MyShares({ navigation }: MySharesProps) {
  const user = useSelector((state: {_persist: any, user: {value: User}}) => state.user.value);
  const isFocused = useIsFocused(); // Permet de recharger quand on revient sur l'écran
  const dispatch = useDispatch();


  // Variables d'état
  const [allShares, setAllShares] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [columns, setColumns] = useState<number>(2);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedShare, setSelectedShare] = useState<any>(null);
  
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
      const myURL = `${BACKEND_URL}/users/my-shares`;
      const response = await fetch(encodeURI(myURL), {
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

  const cardWidth = columns === 1 ? width * 0.9 : (width - 50) / 2;

// Fonction pour relancer 
  const handleRemind = (borrowerId: string, borrowerName: string, movieId: string) => {
    Alert.alert(
      "Relancer",
      `Souhaitez-vous relancer ${borrowerName} ?`,
      [
        { text: "Non", style: "cancel" },
        { 
          text: "Oui", 
          onPress: async () => {
            try {
              const myURL = `${BACKEND_URL}/users/remind-loan`;
              const response = await fetch(encodeURI(myURL), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: user.token, borrowerId, movieId }),
              });
              const data = await response.json();
              if (data.result) {
                Alert.alert('Rappel envoyé 🔔', data.message || "La relance a bien été envoyée !");
              } else {
                Alert.alert('Oups', data.error);
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de joindre le serveur.');
            }
          }
        }
      ]
    );
  };

  // Fonction pour récupérer 
  const handleRecover = (tmdb_id: number, movieTitle: string) => {
    Alert.alert(
      'Retour du film',
      `Validez-vous le fait que "${movieTitle}" est de retour dans votre collection ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Valider', 
          style: 'destructive',
          onPress: async () => {
            try {
              const myURL = `${BACKEND_URL}/users/remove-loan`;
              const response = await fetch(encodeURI(myURL), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: user.token, tmdb_id }),
              });
              
              const data = await response.json();
              if (data.result) {
                // 1. Mise à jour de ton Redux comme dans le Modal
                const indexMovie = user.movies.findIndex((m) => m.tmdb_id == tmdb_id);
                if (indexMovie !== -1) {
                    dispatch(setMovieReturned({ index: indexMovie }));
                }
                
                // 2. Mise à jour visuelle de l'écran MyShares
                fetchMyShares(); 
              } else {
                Alert.alert('Erreur', data.error);
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de joindre le serveur.');
            }
          }
        }
      ]
    );
  };

  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <Header 
        title="Mes Partages" 
        leftIcon={<FontAwesome name="angle-left" size={24} color="#e8be4b" />}
        onPressLeft={() => navigation.goBack()}
        // 🌟 NOUVEAU : La roue des réglages pour changer l'affichage
        rightIcon={<FontAwesome name="cog" size={24} color="#e8be4b" />} 
        onPressRight={() => setColumns(columns === 2 ? 1 : 2)}
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
          <FontAwesome name="film" size={50} color="#c3c3c3" style={{ marginBottom: 15 }} />
          <Text style={styles.emptyText}>Aucun film partagé pour le moment.</Text>
        </View>
      ) : (
      <FlatList
          data={filteredShares}
          keyExtractor={(item, index) => index.toString()}
          numColumns={columns}
          key={columns}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={columns > 1 ? { gap: 10, marginBottom: 15 } : undefined}
          renderItem={({ item }) => {
            
            // Pour la MovieCard, on prépare les données unifiées
            const formattedMovieData = {
              ...(item.movieid || {}),
              isLoaned: item.isLoaned,
              pastLoans: item.pastLoans,
              shareType: item.shareType,
              ownerName: item.ownerName,
              ownerId: item.ownerId
            };

            return (
              <ShareGrid 
                item={item}
                cardWidth={cardWidth}
                columns={columns} // 👈 NOUVEAU : On informe ShareGrid du mode actuel
                onPressImage={() => {
                  setSelectedShare(item);
                  setModalVisible(true);
                }}
                onRemind={() => {
                  const currentLoan = item.pastLoans[item.pastLoans.length - 1];
                  const borrowerId = currentLoan.userid?._id;
                  const borrowerName = currentLoan.userid?.username || currentLoan.borrower || "cet ami";
                  
                  handleRemind(borrowerId, borrowerName, item.movieid._id);
                }}
                onRecover={() => {
                  const movieTitle = item.movieid?.title_fr || item.movieid?.original_title || 'ce film';
                  handleRecover(item.movieid.tmdb_id, movieTitle);
                }}
              />
            );
          }}
        />
      )}
      {selectedShare && (
        <LoanDetailsModal 
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          movieName={selectedShare.movieid?.title_fr || selectedShare.movieid?.original_title}
          movieTmdbId={selectedShare.movieid?.tmdb_id}
          currentLoan={selectedShare.pastLoans?.[selectedShare.pastLoans.length - 1]}
          shareType={selectedShare.shareType}
          ownerName={selectedShare.ownerName}
          onReturnSuccess={() => {
            fetchMyShares(); // Met à jour la liste automatiquement en arrière-plan
            setModalVisible(false); // Ferme la modale
          }}
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
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Styles pour la nouvelle carte sur-mesure
  shareCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  shareInfoContainer: {
    padding: 8,
  },
  shareMovieTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  shareSubtitle: {
    fontSize: 12,
    color: '#aaa',
  },
  boldUser: {
    color: '#e8be4b',
    fontWeight: 'bold',
  },

  // Boutons d'action rapide
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    flex: 1,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});