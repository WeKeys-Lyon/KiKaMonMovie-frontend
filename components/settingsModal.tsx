import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Buttons } from './buttons';
import {changeOrder} from '../reducers/user';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

type SettingsModalProps = {
    visible: boolean;
    onClose: () => void;
    columns: number;
    setColumns: (cols: number) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    movies: any[];
};

export default function SettingsModal({
    visible,
    onClose,
    columns,
    setColumns,
    searchQuery,
    setSearchQuery,
    movies,
}: SettingsModalProps) {
    const [order, setOrder] = useState(true);

    const dispatch = useDispatch();

    //recherche par suggestions
    const suggestions = searchQuery.length > 1
        ? movies.filter((movie: any) => {
            const title = movie.title_fr || movie.original_title;
            return title.toLowerCase().includes(searchQuery.toLowerCase());
        }).slice(0, 5)
        : [];

    //recherche par ordre alphabetique
    const changeReducer = () => {
        setOrder(!order);
        dispatch(changeOrder(order))
    }
    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Réglages & Filtres</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                            <FontAwesome name="times-circle" size={28} color="#ff4d4d" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollArea}>

                        {/* 🔍 SECTION 1 : RECHERCHE */}
                        <Text style={styles.sectionTitle}>Recherche globale</Text>
                        <View style={styles.searchWrapper}>
                            <View style={styles.searchContainer}>
                                <FontAwesome name="search" size={20} color="#92c4d8" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Titre, réalisateur, acteur..."
                                    placeholderTextColor="#aaa"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {suggestions.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <FontAwesome name="times-circle" size={20} color="#aaa" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/*LE MENU DÉROULANT DES SUGGESTIONS */}
                            {suggestions.length > 0 && (
                                <View style={styles.suggestionsContainer}>
                                    {suggestions.map((movie, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.suggestionItem}
                                            onPress={() => {
                                                setSearchQuery(movie.title_fr || movie.original_title);
                                                onClose();
                                            }}
                                        >
                                            <FontAwesome name="film" size={14} color="#e8be4b" style={{ marginRight: 10 }} />
                                            <Text style={styles.suggestionText} numberOfLines={1}>
                                                {movie.title_fr || movie.original_title}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                        
                        {/* 📱 SECTION 2 : AFFICHAGE */}
                        <Text style={styles.sectionTitle}>Format d'affichage</Text>
                        <View style={styles.displayButtonsRow}>
                            <TouchableOpacity
                                style={[styles.displayBtn, columns === 1 && styles.displayBtnActive]}
                                onPress={() => setColumns(1)}
                            >
                                <FontAwesome name="list" size={20} color={columns === 1 ? "#fff" : "#aaa"} />
                                <Text style={[styles.displayBtnText, columns === 1 && { color: '#fff' }]}>Liste</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.displayBtn, columns === 2 && styles.displayBtnActive]}
                                onPress={() => setColumns(2)}
                            >
                                <FontAwesome name="th-large" size={20} color={columns === 2 ? "#fff" : "#aaa"} />
                                <Text style={[styles.displayBtnText, columns === 2 && { color: '#fff' }]}>2 Col</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.displayBtn, columns === 3 && styles.displayBtnActive]}
                                onPress={() => setColumns(3)}
                            >
                                <FontAwesome name="th" size={20} color={columns === 3 ? "#fff" : "#aaa"} />
                                <Text style={[styles.displayBtnText, columns === 3 && { color: '#fff' }]}>3 Col</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 🏷️ SECTION 3 : FILTRES (Structure prête pour la suite) */}
                        <Text style={styles.sectionTitle}>Filtres</Text>
                        <View style={styles.filtersContainer}>
                            <Text style={styles.placeholderText}>⏳ Les filtres (Année, Réalisateur, Genre) arriveront ici...</Text>
                            {/* Ici nous ajouterons des menus déroulants (Pickers) ou des boutons */}
                            <Buttons title="Changer l'ordre alphabetique des titres" onPress={() => changeReducer()} />
                        </View>

                    </ScrollView>

                    <View style={styles.footer}>
                        <Buttons title="Appliquer" onPress={onClose} variant="secondary" />
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'flex-end', 
    },
    modalContent: {
        backgroundColor: '#1C2942',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: '75%',
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#e8be4b',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e8be4b',
    },
    closeIcon: { padding: 5 },
    scrollArea: { flex: 1 },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },

    // Styles Recherche
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        color: '#fff',
        paddingVertical: 12,
        fontSize: 16,
    },

    // Styles Affichage
    displayButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    displayBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        gap: 8,
    },
    displayBtnActive: {
        backgroundColor: 'rgba(232, 190, 75, 0.2)',
        borderColor: '#e8be4b',
    },
    displayBtnText: {
        color: '#aaa',
        fontWeight: 'bold',
    },

    // Styles Filtres
    filtersContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 20,
        borderRadius: 10,
        marginTop: 5,
    },
    placeholderText: { color: '#aaa', fontStyle: 'italic', textAlign: 'center' },

    footer: { marginTop: 20 },

    //recherche

    searchWrapper: {
    position: 'relative', 
    zIndex: 50, 
  },
  suggestionsContainer: {
    backgroundColor: '#2A3B5C', // Un bleu un peu plus clair pour se détacher
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(232, 190, 75, 0.5)', // Bordure dorée légère
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
});