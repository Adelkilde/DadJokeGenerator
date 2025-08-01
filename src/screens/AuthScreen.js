import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    setMessage("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login successful! " + userCredential.user.email);
      navigation.navigate("Generator");
    } catch (error) {
      setMessage("Login failed: Wrong password or email");
    }
  };

  const handleSignup = async () => {
    setMessage("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(database, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: serverTimestamp(),
      });
      alert("Signup successful! Welcome, " + userCredential.user.email);
      navigation.navigate("Generator");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>Or</Text>

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e86de",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 24,
    width: 320,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    width: "100%",
    backgroundColor: "#f8f9fa",
  },
  button: {
    backgroundColor: "#2e86de",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  orText: {
    textAlign: "center",
    marginVertical: 10,
    color: "#888",
    fontWeight: "bold",
  },
  message: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#333",
  },
});
