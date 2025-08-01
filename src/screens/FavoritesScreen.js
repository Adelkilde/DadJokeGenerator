import { useEffect, useState } from "react";
import { Text, View, FlatList, StyleSheet } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, database } from "../config/firebase";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      const q = query(collection(database, "favorites"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      setFavorites(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    };
    fetchFavorites();
  }, [user]);

  const renderFavorite = ({ item }) => (
    <View style={styles.favoriteContainer}>
      <Text style={styles.jokeText}>{item.joke}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Favorite Jokes</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderFavorite}
        ListEmptyComponent={<Text style={styles.emptyText}>No Favorites Yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",
    color: "#2e86de",
  },
  favoriteContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  jokeText: {
    fontSize: 18,
    marginBottom: 6,
  },
  emptyText: {
    color: "#888",
    fontStyle: "italic",
  },
});
