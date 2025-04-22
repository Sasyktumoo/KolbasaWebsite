import React from 'react';
import { View, Text, Button } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const List = ({navigation}: RouterProps) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button onPress={() => navigation.navigate('details')} title="Go to Details" />
      <Button onPress={() => FIREBASE_AUTH.signOut()} title="Sign Out" />
    </View>
  );
}

export default List;