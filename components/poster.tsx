import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type PosterProps = {
    imageUrl: string | boolean;
    isLoaned: boolean;
    isListMode?: boolean;
    columns?: number;
    shareType?: string[];
}

export default function Poster({ imageUrl, isLoaned, columns = 2, shareType}: PosterProps) {

    const getBannerStyle = () => {
    if (columns === 1) return styles.bannerCol1;
    if (columns === 3) return styles.bannerCol3;
    return styles.bannerCol2;
    };
    const getTextStyle = () => {
    if (columns === 1) return styles.textCol1;
    if (columns === 3) return styles.textCol3;
    return styles.textCol2;
  };

    const imageToDraw = () => {
      if (imageUrl) {
        return (<Image source={{ uri: imageUrl }} style={styles.poster} />)
      } else {
        return (<Image source={require('../assets/nomovie.jpg')} style={styles.poster} />)
      }
    }

  const isBorrowed = shareType === 'borrowed';
    const showBanner = isLoaned || isBorrowed; 
    const bannerText = isBorrowed ? "Emprunté" : "Prêt en cours";
    const bannerColor = isBorrowed ? "#e8be4b" : "#ff4d4d";


    return (
        <View style={styles.posterContainer}>
          {imageToDraw()}
            {showBanner && (
                <>
                <View style={styles.grayOverlay} />
                <View style={[styles.banner, getBannerStyle(), { backgroundColor: bannerColor }]}>
                  <Text style={[styles.bannerText, getTextStyle()]}>
                    {bannerText}
                  </Text>
          </View>
        </>
      )}
    </View>
  );
}
  
  const styles = StyleSheet.create({
    posterContainer: {
    width: '100%',
    aspectRatio: 2 / 3,
    position: 'relative',
    backgroundColor: '#1a1a1a',
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  grayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  
  // --- Le socle commun du bandeau ---
  banner: {
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  bannerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // tailles dynamiques de la banner //
  // Mode Liste (Miniature)
  bannerCol1: { top: 10, left: -25, width: 90, paddingVertical: 2 },
  textCol1: { fontSize: 6 },

  // Mode 2 Colonnes (Grand)
  bannerCol2: { top: 22, left: -40, width: 150, paddingVertical: 5 },
  textCol2: { fontSize: 10 },

  // Mode 3 Colonnes (Moyen)
  bannerCol3: { top: 14, left: -30, width: 110, paddingVertical: 3 },
  textCol3: { fontSize: 7.5 },
});
