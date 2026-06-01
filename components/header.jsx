import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header({ title }) {
    const insets = useSafeAreaInsets();
    const displayTitle = title ? title : 'KikaMonMovie'
    return (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <View style={styles.sidezZone}>
                {leftIcon && (
                    <TouchableOpacity onPress={onPressLeft} style={styles.iconButton}>
                        {leftIcon}
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.titleZone}>
                <Text style={styles.title}>{displayTitle}</Text>
            </View>
            <View style={styles.sideZone}>
                {rightIcon && (
                    <TouchableOpacity onPress={onPressRight} style={styles.iconButton}>
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#1C2942',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    sideZone: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleZone: {
    flex: 3, 
    alignItems: 'center',
    justifyContent: 'center',
  },

    content: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 1,
    },
    iconButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 20,
  },
});
