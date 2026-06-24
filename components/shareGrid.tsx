import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Poster from './poster'; 
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ShareGridProps {
  item: any;
  cardWidth: number | string;
  columns?: number; // 🌟 NOUVEAU : Prop pour le mode d'affichage
  onPressImage: () => void;
  onRemind?: () => void;
  onRecover?: () => void;
}

export default function ShareGrid({ item, cardWidth, columns = 2, onPressImage, onRemind, onRecover }: ShareGridProps) {
  const movieInfo = item.movieid || {};
  
  const imageUrl = movieInfo.poster_path 
    ? `https://res.cloudinary.com/dj5fkdyn8/image/upload/v1781111174${movieInfo.poster_path}` 
    : false;
  
  const title = movieInfo.title_fr || movieInfo.original_title || 'Film inconnu';

  let borrowerName = "un ami";
  if (item.shareType === 'loaned' && item.pastLoans && item.pastLoans.length > 0) {
    const currentLoan = item.pastLoans[item.pastLoans.length - 1];
    if (currentLoan.isSharedToUser && currentLoan.userid && currentLoan.userid.username) {
      borrowerName = currentLoan.userid.username;
    } 
    // 2. Sinon, on cherche si c'est un prêt manuel (champ texte "borrower")
    else if (currentLoan.borrower) {
      borrowerName = currentLoan.borrower;
    }
  }

  const isSubscribedUser = item.pastLoans?.[item.pastLoans.length - 1]?.isSharedToUser;

  // 🌟 NOUVEAU : MODE LISTE (1 colonne)
  if (columns === 1) {
    return (
      <View style={[styles.listCard, { width:  typeof(cardWidth) == 'string' ? ('100%') : (cardWidth)}]}>
        
        {/* L'affiche à gauche */}
        <TouchableOpacity activeOpacity={0.8} onPress={onPressImage} style={styles.listPosterContainer}>
          <Poster 
            imageUrl={imageUrl} 
            isLoaned={item.shareType === 'loaned'} 
            shareType={item.shareType} 
            columns={1} // Pour que le bandeau s'adapte !
          />
        </TouchableOpacity>

        {/* Infos et boutons à droite */}
        <View style={styles.listInfoContainer}>
          <View>
            <Text style={styles.shareMovieTitle} numberOfLines={2}>{title}</Text>
            {item.shareType === 'loaned' ? (
              <Text style={styles.shareSubtitle}>Prêté à : <Text style={styles.boldUser}>{borrowerName}</Text></Text>
            ) : (
              <Text style={styles.shareSubtitle}>Prêt de : <Text style={styles.boldUser}>{item.ownerName}</Text></Text>
            )}
          </View>

          {/* Boutons d'action rapides */}
          {item.shareType === 'loaned' && (
            <View style={styles.listActionButtonsRow}>
              {isSubscribedUser && (
                <TouchableOpacity 
                  style={[styles.quickButton, { backgroundColor: '#e8be4b', flex: 1 }]}
                  onPress={onRemind ? onRemind : () => Alert.alert("Relancer", `Envoyer un rappel ?`)}
                >
                  <FontAwesome name="bell" size={12} color="#1C2942" />
                  <Text style={[styles.quickButtonText, { color: '#1C2942' }]} numberOfLines={1}>Relancer</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.quickButton, { backgroundColor: '#5cb85c', flex: 1 }]}
                onPress={onRecover ? onRecover : () => Alert.alert("Récupérer", `Film récupéré ?`)}
              >
                <FontAwesome name="check" size={12} color="#fff" />
                <Text style={styles.quickButtonText}>Récupéré</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  // --- MODE GRILLE CLASSIQUE (2 colonnes) ---
  return (
    <View style={[styles.shareCard,  { width : typeof(cardWidth) == 'string' ? ('100%') : (cardWidth)}]}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPressImage}>
        <Poster imageUrl={imageUrl} isLoaned={item.shareType === 'loaned'} shareType={item.shareType} />
      </TouchableOpacity>

      <View style={styles.shareInfoContainer}>
        <Text style={styles.shareMovieTitle} numberOfLines={1}>{title}</Text>
        {item.shareType === 'loaned' ? (
          <Text style={styles.shareSubtitle}>Prêté à : <Text style={styles.boldUser}>{borrowerName}</Text></Text>
        ) : (
          <Text style={styles.shareSubtitle}>Prêt de : <Text style={styles.boldUser}>{item.ownerName}</Text></Text>
        )}
      </View>

      {item.shareType === 'loaned' && (
        <View style={styles.actionButtonsRow}>
          {isSubscribedUser && (
            <TouchableOpacity 
              style={[styles.quickButton, { backgroundColor: '#e8be4b' }]}
              onPress={onRemind ? onRemind : () => Alert.alert("Relance", `Envoyer un rappel ?`)}
            >
              <FontAwesome name="bell" size={12} color="#1C2942" />
              <Text style={[styles.quickButtonText, { color: '#1C2942' }]}>Relancer</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.quickButton, { backgroundColor: '#5cb85c', flex: 1 }]}
            onPress={onRecover ? onRecover : () => Alert.alert("Récupérer", `Film récupéré ?`)}
          >
            <FontAwesome name="check" size={12} color="#fff" />
            <Text style={styles.quickButtonText}>Récupéré</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Styles Communs & Mode Grille ---
  shareCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  shareInfoContainer: { padding: 8 },
  shareMovieTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  shareSubtitle: { fontSize: 12, color: '#aaa' },
  boldUser: { color: '#e8be4b', fontWeight: 'bold' },
  
  actionButtonsRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 8, paddingBottom: 8, justifyContent: 'space-between' },
  quickButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 4, flex: 1 },
  quickButtonText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // --- NOUVEAU : Styles Mode Liste ---
  listCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  listPosterContainer: {
    width: 80,
    borderRadius: 5,
    overflow: 'hidden',
  },
  listInfoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  listActionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
});