import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');


interface MovieCardProps {
  movie: any;
  columns: number;
  cardWidth: number | string;
  onPress: () => void;
}

export default function MovieCard({ movie, columns, cardWidth, onPress }: MovieCardProps) {
  
  const imageUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=Pas+d%27affiche';
  
  const year = movie.release_date ? movie.release_date.substring(0, 4) : '';
  const title = movie.title_fr || movie.original_title;

  // --- MODE LISTE (1 colonne) ---
  if (columns === 1) {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri: imageUrl }} style={styles.listPoster} />
        <View style={styles.listInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>{title}</Text>
          {year ? <Text style={styles.movieYear}>{year}</Text> : null}
        </View>
      </TouchableOpacity>
    );
  }

  // --- MODE GRILLE (2 ou 3 colonnes) ---
  return (
    <TouchableOpacity style={[styles.gridCard, { width: cardWidth }]} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: imageUrl }} style={[styles.gridPoster, { height: Number(cardWidth) * 1.45 }]} />
      <View style={styles.infoContainer}>
        <Text style={styles.movieTitle} numberOfLines={1}>{title}</Text>
        {year ? <Text style={styles.movieYear}>{year}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  // --- Styles Communs ---
  infoContainer: { padding: 5 },
  movieTitle: { fontSize: 13, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  movieYear: { fontSize: 11, color: '#e8be4b', fontWeight: '600' },

  // --- Mode Grille ---
  gridCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gridPoster: { width: '100%', backgroundColor: '#1a1a1a' },

  // --- Mode Liste ---
  listCard: {
    flexDirection: 'row',
    width: width * 0.9, // Prend toute la largeur de la liste
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  listPoster: { width: 80, height: 120, backgroundColor: '#1a1a1a' },
  listInfo: { flex: 1, padding: 15, justifyContent: 'center' },
});