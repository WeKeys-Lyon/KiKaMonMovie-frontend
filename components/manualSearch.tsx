import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Buttons } from './buttons';

type ManualSearchProps = {
  queryTitle: string;
  setQueryTitle: (text: string) => void;
  queryPerson: string;
  setQueryPerson: (text: string) => void;
  launchSearchTitle: () => void;
  launchSearchPeople: () => void;
  cancelSearch: () => void;
  error?: string;
  error2?: string;
};

export default function ManualSearch({
  queryTitle, setQueryTitle, queryPerson, setQueryPerson, launchSearchTitle, launchSearchPeople, cancelSearch, error, error2
}: ManualSearchProps) {
  return (
    <View style={styles.searchContainer}>
      {/* Box Recherche par Titre */}
      <View style={styles.searchBox}>
        <Text style={styles.titleBox}>Titre du film</Text>
        <TextInput
          placeholder="Ex: Inception..."
          placeholderTextColor="#ccc"
          value={queryTitle}
          onChangeText={setQueryTitle}
          style={styles.input}
          onSubmitEditing={launchSearchTitle}
        />
        <View style={styles.searchButtonsRow}>
          <Buttons title="Annuler" onPress={cancelSearch} variant="secondary" />
          <Buttons title="Chercher" onPress={launchSearchTitle} variant="secondary" />
        </View>
        {(error) ? (<Text style={{color: 'red', fontSize: 26, textAlign: 'center', marginTop: 10}}>{error}</Text>) : ('')}
      </View>

      {/* Box Recherche par Personnalité */}
      <View style={styles.searchBox}>
        <Text style={styles.titleBox}>Rechercher par personnalité</Text>
        <TextInput
          placeholder="Ex: Clint Eastwood..."
          placeholderTextColor="#ccc"
          value={queryPerson}
          onChangeText={setQueryPerson}
          style={styles.input}
          onSubmitEditing={launchSearchPeople}
        />
        <View style={styles.searchButtonsRow}>
          <Buttons title="Annuler" onPress={cancelSearch} variant="secondary" />
          <Buttons title="Chercher" onPress={launchSearchPeople} variant="secondary" />
        </View>
        {(error2) ? (<Text style={{color: 'red', fontSize: 26, textAlign: 'center', marginTop: 10}}>{error2}</Text>) : ('')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    alignItems: 'center',
  },
  searchBox: {
    width: '90%',
    backgroundColor: 'rgba(28, 41, 66, 0.85)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e8be4b',
  },
  titleBox: {
    color: '#e8be4b',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  searchButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});