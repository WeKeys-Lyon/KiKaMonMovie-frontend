import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@react-native-vector-icons/fontawesome';

interface StarRatingProps {
  rating: number;
  onRatingPress?: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

export default function StarRating({ rating, onRatingPress, size = 30, disabled = false }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          activeOpacity={0.7}
          disabled={disabled || !onRatingPress} 
          onPress={() => onRatingPress && onRatingPress(star)}
        >
          <FontAwesome
            name={star <= rating ? "star" : "star-o"} 
            size={size}
            color="#e8be4b"
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  star: {
    marginHorizontal: 5,
  },
});