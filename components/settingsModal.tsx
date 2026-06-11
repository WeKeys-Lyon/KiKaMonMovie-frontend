import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Buttons } from './buttons';

type SettingsModalProps = {
    visible: boolean;
    onClose: () => void;
    columns: number;
    setColumns: (cols: number) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    movies: any[];
    sortOption: string;
    setSortOption: (option: string) => void;
};

export default function SettingsModal({
    visible,
    onClose,
    columns,
    setColumns,
    searchQuery,
    setSearchQuery,
    movies,
    sortOption,
    setSortOption,
}: SettingsModalProps) {

    //recherche par suggestions
    const getGlobalSuggestions = () => {
        if (searchQuery.trim().length <= 1) return [];
        const lowerText = searchQuery.toLowerCase();
        const allSuggestions:{ type:string; value: string }[] = [];
            movies.forEach((movie: any) => {
                const title = movie.title_fr || movie.original_title || '';
                if (title && title.toLowerCase().includes(lowerText)) {
                    allSuggestions.push({ type: 'Film', value: title });
                }
                const year = movie.release_date ? movie.release_date.substring(0, 4) : '';
                if (year.includes(searchQuery)) {
                    allSuggestions.push({ type: 'Année', value: year });
                }
                if (movie.Cast) {
                movie.Cast.forEach((actor: any) => {
                    if (actor.name && actor.name.toLowerCase().includes(lowerText)) {
                        allSuggestions.push({ type: 'Acteur', value: actor.name });
                    }
                });
            }
            // 4. Réalisateurs
            if (movie.DirectedBy) {
                movie.DirectedBy.forEach((director: any) => {
                    if (director.name && director.name.toLowerCase().includes(lowerText)) {
                        allSuggestions.push({ type: 'Réalisateur', value: director.name });
                    }
                });
            }
            // 5. Compositeurs
            if (movie.MusicBy) {
                movie.MusicBy.forEach((composer: any) => {
                    if (composer.name && composer.name.toLowerCase().includes(lowerText)) {
                        allSuggestions.push({ type: 'Compositeur', value: composer.name });
                    }
                });
            }
        });

        // Déduplication : on enlève les doublons
        const uniqueSuggestions = Array.from(
            new Set(allSuggestions.map((s) => JSON.stringify(s)))
        ).map((s) => JSON.parse(s));

        return uniqueSuggestions.slice(0, 5); // On garde les 5 meilleurs
    };

    const suggestions = getGlobalSuggestions();


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
                                    {suggestions.map((item, index) => {
                                        // On choisit l'icône selon le type
                                        let iconName = "film";
                                        if (item.type === 'Acteur' || item.type === 'Réalisateur') iconName = "user";
                                        else if (item.type === 'Compositeur') iconName = "music";
                                        else if (item.type === 'Année') iconName = "calendar";

                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.suggestionItem}
                                                onPress={() => {
                                                    setSearchQuery(item.value); // On enregistre ce qu'on a cliqué
                                                    onClose(); // On ferme la modale
                                                }}
                                            >
                                                <FontAwesome name={iconName as any} size={14} color="#e8be4b" style={{ width: 20, textAlign: 'center', marginRight: 10 }} />
                                                <Text style={styles.suggestionText} numberOfLines={1}>
                                                    {item.value} <Text style={styles.suggestionType}>({item.type})</Text>
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
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

                        {/* SECTION : TRI */}
                        <Text style={styles.sectionTitle}>Trier par</Text>
                        <View style={styles.sortButtonsRow}>
                            <TouchableOpacity
                                style={[styles.sortBtn, sortOption === 'title_origin_asc' && styles.displayBtnActive]}
                                onPress={() => setSortOption('title_origin_asc')}
                            >
                                <FontAwesome name="sort-alpha-asc" size={16} color={sortOption === 'title_origin_asc' ? "#fff" : "#aaa"} />
                                <Text style={[styles.displayBtnText, sortOption === 'title_origin_asc' && { color: '#fff', fontSize: 13 }]}>Titre Original</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sortBtn, sortOption === 'title_origin_desc' && styles.displayBtnActive]}
                                onPress={() => setSortOption('title_origin_desc')}
                            >
                                <FontAwesome name="sort-alpha-desc" size={16} color={sortOption === 'title_origin_desc' ? "#fff" : "#aaa"} />
                                <Text style={[styles.displayBtnText, sortOption === 'title_origin_desc' && { color: '#fff', fontSize: 13 }]}>Titre Original</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sortBtn, sortOption === 'title_asc' && styles.displayBtnActive]}
                                onPress={() => setSortOption('title_asc')}
                            >
                                <FontAwesome name="sort-alpha-asc" size={16} color={sortOption === 'title_asc' ? "#fff" : "#aaa"} />
                                <Text style={[styles.displayBtnText, sortOption === 'title_asc' && { color: '#fff' }]}>A-Z</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sortBtn, sortOption === 'title_desc' && styles.displayBtnActive]}
                                onPress={() => setSortOption('title_desc')}
                            >
                                <FontAwesome name="sort-alpha-desc" size={16} color={sortOption === 'title_desc' ? "#fff" : "#aaa"} />
                                <Text style={[styles.displayBtnText, sortOption === 'title_desc' && { color: '#fff' }]}>Z-A</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sortBtn,  sortOption === 'year_desc' && styles.displayBtnActive]}
                                onPress={() => setSortOption('year_desc')}
                            >
                                <FontAwesome name="calendar" size={16} color={sortOption === 'year_desc' ? "#fff" : "#aaa"} />
                                <Text style={[styles.displayBtnText, sortOption === 'year_desc' && { color: '#fff', fontSize: 13 }]}>Récent</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.sortBtn, sortOption === 'year_asc' && styles.displayBtnActive]}
                                onPress={() => setSortOption('year_asc')}
                            >
                                <FontAwesome name="history" size={16} color={sortOption === 'year_asc' ? "#fff" : "#aaa"} />
                                <Text style={[styles.displayBtnText, sortOption === 'year_asc' && { color: '#fff', fontSize: 13 }]}>Ancien</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 🏷️ SECTION 3 : FILTRES (Structure prête pour la suite) */}
                        <Text style={styles.sectionTitle}>Filtres</Text>
                        <View style={styles.filtersContainer}>
                            <Text style={styles.placeholderText}>⏳ Les filtres (Année, Réalisateur, Genre) arriveront ici...</Text>
                            {/* Ici nous ajouterons des menus déroulants (Pickers) ou des boutons */}
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
        backgroundColor: '#2A3B5C',
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
    backgroundColor: '#2A3B5C', // Un bleu)àç!è  un peu plus clair pour se détacher
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
  //tri
    sortButtonsRow: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'flex-start',
        gap: 15,
        marginBottom: 10,
        width: '100%'
        
    },
    sortBtn: {
        /* flex: 1,
        flexDirection: 'row', */
        width: 150,
        alignItems: 'center',
        /* justifyContent: 'center', */
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        gap: 8,
    }
});