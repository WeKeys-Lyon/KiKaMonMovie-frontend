import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Buttons } from './buttons';

type SearchResultsProps = {
  movieData: any[];
  queryAsked: string;
  drawStyle: boolean;
  backToSearch: () => void;
  handleOpenModal: (movie: any) => void;
};

export default function SearchResults({
  movieData,
  queryAsked,
  drawStyle,
  backToSearch,
  handleOpenModal,
}: SearchResultsProps) {
  return (
    <View style={styles.resultsContainer}>
      <View style={styles.backButtonContainer}>
        <Buttons title="Nouvelle recherche" onPress={backToSearch} variant="secondary" />
        <Text style={styles.text}>Résultats pour {queryAsked}</Text>
      </View>
      
      <FlatList
        data={movieData}
        keyExtractor={(item, index) => item.tmdb_id ? item.tmdb_id.toString() : index.toString()}
        style={styles.list}
        renderItem={({ item }) => {
          const year = item.release_date ? item.release_date.substring(0, 4) : 'N/A';
          const director = item.DirectedBy && item.DirectedBy.length > 0
            ? item.DirectedBy[0].name
            : 'Réalisateur inconnu';

          return (
            <TouchableOpacity onPress={() => handleOpenModal(item)}>
              <View style={styles.movieCard}>
                <Image 
                  source={item.poster_path ? { uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` } : require('../assets/nomovie.jpg')} 
                  style={styles.poster} 
                />
                <View style={styles.movieInfo}>
                  <Text style={[styles.movieTitle, { marginBottom: drawStyle ? 18 : 4 }]} numberOfLines={2}>
                    {item.title_fr ? item.title_fr : item.original_title}
                  </Text>
                  
                  {!drawStyle && (
                    <Text style={styles.movieVOTitle}>
                      {item.title_fr && item.title_fr !== item.original_title ? item.original_title : ''}
                    </Text>
                  )}
                  
                  <Text style={styles.movieYear}>{year}</Text>
                  
                  {!drawStyle && <Text style={styles.movieDirector}>{director}</Text>} 
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
  },
  backButtonContainer: {
    width: '90%',
    marginBottom: 10,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
  list: {
    width: '95%',
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e8be4b',
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 5,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  movieVOTitle: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  movieYear: {
    fontSize: 16,
    color: '#e8be4b',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  movieDirector: {
    fontSize: 14,
    color: '#ccc',
  },
});