import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import Header from '../components/header';
import MovieGrid from '../components/MovieGrid'; // Ton composant d'affichage
import { FontAwesome } from '@expo/vector-icons';

type FriendCollectionProps = {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<any, any>; // Pour récupérer les paramètres passés dans la navigation
};

const BACKEND_URL = process.env.BACKEND_URL;

export default function FriendCollection({ navigation, route }: FriendCollectionProps) {
  const user = useSelector((state: any) => state.user.value);
  const { friendId, friendName } = route.params;

  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    fetchFriendCollection();
  }, []);

  const fetchFriendCollection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/users/friend-collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: user.token, friendId: friendId }),
      });
      const data = await response.json();

      if (data.result) {
        // On extrait juste la partie 'movieid' de tes objets complexes pour l'affichage
        const formattedMovies = data.movies.map((m: any) => m.movieid);
        setMovies(formattedMovies);
      } else {
        if (data.error.includes('restreint')) {
          setAccessDenied(true);
        } else {
          Alert.alert('Erreur', data.error);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la collection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title={`Collection de ${friendName}`} 
        leftIcon={<FontAwesome name="home" size={28} color="#e8be4b" />}
        onPressLeft={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#e8be4b" />
        </View>
      ) : accessDenied ? (
        <View style={styles.centerBox}>
          <FontAwesome name="lock" size={60} color="#d9534f" style={{ marginBottom: 20 }} />
          <Text style={styles.errorText}>{friendName} a rendu sa collection privée.</Text>
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>La collection de {friendName} est vide.</Text>
        </View>
      ) : (
        <View style={{ flex: 1, padding: 10 }}>
          <FlatList
            data={movies}
            keyExtractor={(item) => item.tmdb_id.toString()}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={{ margin: 5 }}>
                <MovieGrid
                  movie={item}
                  columns={2}
                  cardWidth={170} // Adapte selon la taille de ton écran
                  onPress={() => {
                    // Optionnel : rediriger vers la fiche détaillée du film
                    console.log("Détails du film", item.title_fr);
                  }}
                />
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C2942' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#d9534f', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  emptyText: { color: '#aaa', fontSize: 16, fontStyle: 'italic' },
});