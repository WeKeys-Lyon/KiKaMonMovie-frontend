import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Poster from './poster';
import FontAwesome  from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {iLikeThisMovie} from '../reducers/user';

const { width } = Dimensions.get('window');


interface MovieGridProps {
  titleOriginal: string,
  movie: any;
  columns: number;
  cardWidth: number | string;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function MovieGrid({ movie, columns, cardWidth, onPress, onLongPress, titleOriginal }: MovieGridProps) {
  
  const BACKEND_URL = process.env.BACKEND_URL;
  const user = useSelector((state: any) => state.user.value);
  const dispatch = useDispatch();

  const imageUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=Pas+d%27affiche';
  
  const year = movie.release_date ? movie.release_date.substring(0, 4) : '';
  const title = (titleOriginal == 'title_origin_asc' || titleOriginal == 'title_origin_desc' ) ? movie.original_title : movie.title_fr;

  
  const [isLiked, setIsLiked] = useState<boolean>(movie.isLiked);
  
  //données en mode liste//
  const originalTitle = movie.original_title;
  const showVO = movie.title_fr && movie.title_fr !== movie.original_title;
  const director = movie.DirectedBy && movie.DirectedBy.length > 0
    ? movie.DirectedBy[0].name
    : 'Réalisateur inconnu';
  const numberLoan = movie.pastLoans?.length;
  const indexMovie = user.movies.findIndex(film => movie.tmdb_id == film.tmdb_id);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    const myURL = `${BACKEND_URL}/users/isLiked`;
    const response = await fetch(encodeURI(myURL), {
       method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: user.token,
          tmdb_id: movie.tmdb_id
        }),
    });
    const data = await response.json();
    dispatch(iLikeThisMovie({index: indexMovie}))    
  }
  // --- MODE LISTE (1 colonne) ---
  if (columns === 1) {
    return (
      
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.8} onLongPress={onLongPress}>
        
        {/* L'affiche avec le bandeau de prêt intelligent */}
        <View style={styles.listPosterContainer}>
          <Poster 
             imageUrl={imageUrl} 
             isLoaned={movie.isLoaned} 
             isListMode={true} 
          />
        </View>

        {/* Les informations détaillées */}
        <View style={styles.listInfo}>
          <Text style={styles.listTitle} numberOfLines={2}>
            {title}
          </Text>
          
          {showVO && (
            <Text style={styles.listVOTitle} numberOfLines={1}>
              {originalTitle}
            </Text>
          )}
          
          <Text style={styles.listYear}>{year}</Text>
          <Text style={styles.listDirector} numberOfLines={1}>{director}</Text>
          <Text style={{color:'#fff'}}>{(numberLoan) ? `Partagé ${numberLoan} fois` : 'Jamais partagé'}</Text>
        </View>
        <TouchableOpacity onPress={() => handleLike()}  style={{justifyContent: 'center'}}>
          {(isLiked) ? <FontAwesome name="heart" size={20} color='#ff0000' style={styles.icon} /> : <FontAwesome name="heart" size={20} color='#bebebe' style={styles.icon} />}
          </TouchableOpacity>
        

      </TouchableOpacity>
    );
  }

  // MODE GRILLE (2 ou 3 colonnes)
  return (
    <TouchableOpacity style={[styles.gridCard, { width: cardWidth }]} onPress={onPress} activeOpacity={0.8} onLongPress={onLongPress}>
      <Poster imageUrl={imageUrl} isLoaned={movie.isLoaned} />
      <View style={styles.infoContainer}>
        <Text style={styles.movieTitle} numberOfLines={1}>{title}</Text>
        {year !== 'N/A' ? <Text style={styles.movieYear}>{year}</Text> : null}
        {(columns === 3) ? (<TouchableOpacity onPress={() => handleLike()}  style={{alignItems: 'flex-end'}}>
          {(isLiked) ? <FontAwesome name="heart" size={20} color='#ff0000' style={styles.icon} /> : <FontAwesome name="heart" size={20} color='#bebebe' style={styles.icon} />}
          </TouchableOpacity>) : (<View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color:'#fff'}}>{(numberLoan) ? `Partagé ${numberLoan} fois` : 'Jamais partagé'}</Text>
        <TouchableOpacity onPress={() => handleLike()}  style={{}}>
          {(isLiked) ? <FontAwesome name="heart" size={20} color='#ff0000' style={styles.icon} /> : <FontAwesome name="heart" size={20} color='#bebebe' style={styles.icon} />}
          </TouchableOpacity></View>) }
        
          
              
      </View>

    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  // --- Styles Communs (Mode Grille) ---1
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

  // --- NOUVEAU : Mode Liste  ---
  listCard: {
    flexDirection: 'row',
    width: width * 0.9, 
    backgroundColor: 'rgba(0, 0, 0, 0.75)', 
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    //borderColor: '#e8be4b',
  },
  listPosterContainer: {
    width: 80,
    borderRadius: 5,
    overflow: 'hidden', 
  },
  listInfo: { 
    flex: 1, 
    marginLeft: 15, 
    justifyContent: 'center' 
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  listVOTitle: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  listYear: {
    fontSize: 16,
    color: '#e8be4b',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listDirector: {
    fontSize: 14,
    color: '#ccc',
  },
});