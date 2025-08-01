import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity, TextInput, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { auth, database } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDoc,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function GeneratorScreen() {
  const [joke, setJoke] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState(null);
  const [jokes, setJokes] = useState([]);
  const [addJoke, setAddJoke] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchJokes();
    }, [])
  );

  async function fetchJokes() {
    const snapshot = await getDocs(collection(database, "jokes"));
    const jokesArray = snapshot.docs.map((doc) => doc.data().text);
    setJokes(jokesArray);
    setJoke((currentJoke) => (jokesArray.includes(currentJoke) ? currentJoke : ""));
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert("Login Required", "You need to be logged in to add to favorites");
      return;
    }
    if (!joke) return;
    const favRef = doc(database, "favorites", `${user.uid}_${joke}`);
    if (isFavorite) {
      await deleteDoc(favRef);
      setIsFavorite(false);
    } else {
      await setDoc(favRef, {
        userId: user.uid,
        joke,
        createdAt: serverTimestamp(),
      });
      setIsFavorite(true);
    }
  };

  useEffect(() => {
    const checkFavorite = async () => {
      setIsFavorite(false);

      if (!user || !joke || joke === "No jokes found in database.") {
        return;
      }
      const favRef = doc(database, "favorites", `${user.uid}_${joke}`);
      const favSnap = await getDoc(favRef);
      setIsFavorite(favSnap.exists());
    };
    checkFavorite();
  }, [joke, user]);

  const handleGenerateJoke = () => {
    if (jokes.length === 0) {
      setJoke("No jokes found in database.");
      return;
    }
    fetchJokes();
    const randomIndex = Math.floor(Math.random() * jokes.length);
    setJoke(jokes[randomIndex]);
  };

  const handleAddJoke = async () => {
    if (addJoke.trim() === "") {
      alert("Please type a joke before adding it.");
      return;
    }
    try {
      await addDoc(collection(database, "jokes"), {
        text: addJoke,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      alert("Joke added successfully!");
      fetchJokes();
      setAddJoke("");
    } catch (error) {
      alert("Error adding joke: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("You have been logged out successfully.");
    } catch (error) {
      alert("Error logging out: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLeftButton}>
        {!user ? (
          <Button
            title="Login / Signup"
            onPress={() => navigation.navigate("Login")}
            color="#2e86de"
          />
        ) : (
          <View style={styles.rowGap8}>
            <Button
              title="Favorites"
              onPress={() => navigation.navigate("FavoritesScreen")}
              color="#f1c40f"
            />
            <Button title="Logout" onPress={handleLogout} color="#e74c3c" />
          </View>
        )}
      </View>
      <View style={styles.jokeContainer}>
        <Text style={styles.jokeText}>{joke ? `"${joke}"` : ""}</Text>
        {joke !== "" && (
          <TouchableOpacity onPress={handleToggleFavorite}>
            <FontAwesome
              name={isFavorite ? "star" : "star-o"}
              size={24}
              color={isFavorite ? "gold" : "gray"}
              style={styles.favoriteIcon}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.buttonWrapper}>
        <Button title="Generate Joke" onPress={handleGenerateJoke} />
      </View>
      <View style={styles.buttonWrapper}>
        {user && (
          <>
            <Button title="Add Joke" onPress={handleAddJoke} />
            <TextInput
              style={styles.textInput}
              value={addJoke}
              onChangeText={setAddJoke}
              placeholder="Type your joke here..."
            />
          </>
        )}
      </View>
      <View style={styles.topRightButton}>
        <Button title="Joke List" onPress={() => navigation.navigate("JokeList")} color="#27ae60" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  topLeftButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },
  topRightButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  buttonWrapper: {
    marginTop: 20,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  joke: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 20,
  },
  jokeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  jokeText: {
    fontSize: 18,
    fontStyle: "italic",
    maxWidth: "80%",
    textAlign: "center",
  },
  textInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 20,
    width: "80%",
    paddingHorizontal: 10,
  },
  favoriteIcon: {
    marginLeft: 10,
  },
  rowGap8: {
    flexDirection: "row",
    columnGap: 8,
    alignItems: "center",
  },
});
