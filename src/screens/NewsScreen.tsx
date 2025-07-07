import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TextPagesLayout from '../components/TestPagesLayout';

const NewsScreen = () => {
  return (
    <TextPagesLayout>
      <View style={styles.content}>
        <Text style={styles.text}>News</Text>
      </View>
    </TextPagesLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  }
});

export default NewsScreen;