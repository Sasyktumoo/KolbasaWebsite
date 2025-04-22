import {View , Text, TextInput, StyleSheet, ActivityIndicator, Button} from 'react-native';
import React, {useState} from 'react';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);
    } catch (error) {
      console.error('Error logging in:', error);
    } finally {
      setLoading(false);
    }
  };
  const signUp = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered:', userCredential.user);
      alert("Check your emails!");
    } catch (error) {
      console.error('Error registering:', error);
      alert("Sign up failed!");
    } finally {
      setLoading(false);
    }
  };
      return (
    <View style = {styles.container}>
      <TextInput style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail}
        autoCapitalize="none"
      >
      </TextInput>

      <TextInput style={styles.input} 
        secureTextEntry={true}
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword}
        autoCapitalize="none"
      >
      </TextInput>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Button title="Login" onPress={signIn} />
          <Button title="Create account" onPress={signUp} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
})


export default Login

