import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header({title}) {
    const insets = useSafeAreaInsets();
    const displayTitle = title ? title : 'KikaMonMovie'
    return (
        <View style={[styles.headerContainer, {paddingTop: insets.top}]}>
            <View style={styles.content}>
                <Text style={styles.title}>{displayTitle}</Text>
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
            height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
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
});
