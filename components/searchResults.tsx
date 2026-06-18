import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet} from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Buttons } from './buttons';
import { Checkbox } from 'expo-checkbox';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {addMovieToStore} from '../reducers/user';

type SearchResultsProps = {
  navigation: NavigationProp<ParamListBase>;
  movieData: any[];
  queryAsked: string;
  drawStyle: boolean;
  backToSearch: () => void;
  handleOpenModal: (movie: any) => void;
};

export default function SearchResults({
  navigation,
  movieData,
  queryAsked,
  drawStyle,
  backToSearch,
  handleOpenModal,
}: SearchResultsProps) {
  const user = useSelector((state: any) => state.user.value);
  const [checkedMovies, setCheckedMovies] = useState<any[]>([]);
  const dispatch = useDispatch();
  const checkThisBox= (item) => {
    if (checkedMovies.find(movie => movie == item.tmdb_id)) {
      setCheckedMovies(checkedMovies.filter(movie => movie !== item.tmdb_id))
    } else {
      setCheckedMovies(prevData => [...prevData, item.tmdb_id]) 
    }
  };

  const BACKEND_URL = process.env.BACKEND_URL;
  
  const handleAddMovies = async () => {
    try {
      const myURL = `${BACKEND_URL}/users/add-movies`
      const response = await fetch(encodeURI(myURL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: user.token,
          moviesid: checkedMovies
        }),
      });
      const data = await response.json();

      if (data.result) {
        data.answer.forEach((movie:any) => {
          if (movie) {
            if (user.movies.find((film) => film.tmdb_id == movie.tmdb_id)) {
              console.log('niet')
            } else {
              dispatch(addMovieToStore(movie));
            }
          }         
        })
         navigation.navigate('TabNavigator', { screen: 'Ma Collection' });
      } else {
        console.log("Erreur backend", data.error);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  }
  return (
    <View style={styles.resultsContainer}>
      <View style={styles.backButtonContainer}>
        <Buttons title="Nouvelle recherche" onPress={backToSearch} variant="secondary" style={{width: '55%'}}/>
        <Text style={[styles.text, {textAlign: 'center', fontSize: 22 }]}>{drawStyle ? (`Voici les films où \n ${queryAsked} \na participé.`) : (`Voici les films ayant pour titre \n ${queryAsked}`)}</Text>
        {(checkedMovies.length > 0) ? (<Buttons title="Ajout groupé" onPress={handleAddMovies} variant="secondary" style={{backgroundColor: '#e8be4b', width: '55%'}}/>) : (<></>) }
      </View>
      
      <FlatList
        data={movieData}
        keyExtractor={(item, index) => item.tmdb_id ? item.tmdb_id.toString() : index.toString()}
        style={styles.list}
        renderItem={({ item }) => {
          item.checked = false;
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
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Checkbox
                        style={{margin: 8}}
                        value={checkedMovies.find(movie => movie == item.tmdb_id)}
                        onValueChange={() => checkThisBox(item)}
                        color={checkedMovies.find(movie => movie == item.tmdb_id ) ? '#e8be4b' : undefined}
                    />
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
    marginBottom: 10,
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
    flex: 8,
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