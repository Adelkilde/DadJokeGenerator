import { useEffect, useState } from "react";
import { Text, View, FlatList, StyleSheet, TouchableOpacity, Button, Alert } from "react-native";
import { collection, getDocs, getDoc, doc, deleteDoc, writeBatch } from "firebase/firestore";
import { auth, database } from "../config/firebase";

export default function JokeListScreen() {
  const [yourJokes, setYourJokes] = useState([]);
  const [otherJokes, setOtherJokes] = useState([]);
  const [userEmails, setUserEmails] = useState({});
  const user = auth.currentUser;

  useEffect(() => {
    fetchJokes();
  }, [user]);

  const fetchJokes = async () => {
    const snapshot = await getDocs(collection(database, "jokes"));
    const jokesArray = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const userIds = Array.from(new Set(jokesArray.map((j) => j.userId).filter(Boolean)));

    const emails = {};
    await Promise.all(
      userIds.map(async (uid) => {
        try {
          const userDoc = await getDoc(doc(database, "users", uid));
          if (userDoc.exists()) {
            emails[uid] = userDoc.data().email;
          } else {
            emails[uid] = "Unknown";
          }
        } catch {
          emails[uid] = "Unknown";
        }
      })
    );
    setUserEmails(emails);

    if (user) {
      setYourJokes(jokesArray.filter((j) => j.userId === user.uid));
      setOtherJokes(jokesArray.filter((j) => j.userId !== user.uid));
    } else {
      setYourJokes([]);
      setOtherJokes(jokesArray);
    }
  };

  const handleDeleteJoke = async (jokeId) => {
    Alert.alert("Delete Joke", "Are you sure you want to delete your joke?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const jokeDoc = await getDoc(doc(database, "jokes", jokeId));
            const jokeText = jokeDoc.exists() ? jokeDoc.data().text : null;
            await deleteDoc(doc(database, "jokes", jokeId));
            if (jokeText) {
              const favSnapshot = await getDocs(collection(database, "favorites"));
              const batch = writeBatch(database);
              favSnapshot.forEach((favDoc) => {
                if (favDoc.data().joke === jokeText) {
                  batch.delete(favDoc.ref);
                }
              });
              await batch.commit();
            }
            fetchJokes();
          } catch (error) {
            console.error("Error deleting joke:", error);
          }
        },
      },
    ]);
  };

  const renderJokeItem = ({ item }) => (
    <View style={styles.jokeContainer}>
      <Text style={styles.jokeText}>{item.text}</Text>
      {item.userId && (
        <Text style={styles.submittedBy}>
          Submitted by: <Text style={styles.emailText}>{userEmails[item.userId] || "Unknown"}</Text>
        </Text>
      )}
      {user && item.userId === user.uid && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteJoke(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Joke List</Text>
      {user && (
        <>
          <Text style={styles.sectionHeader}>Your Jokes</Text>
          <FlatList
            data={yourJokes}
            keyExtractor={(item) => item.id}
            renderItem={renderJokeItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>You haven't submitted any jokes yet.</Text>
            }
            contentContainerStyle={yourJokes.length === 0 ? styles.centeredList : undefined}
            style={styles.flatListYourJokes}
          />
        </>
      )}
      <Text style={styles.sectionHeader}>{user ? "Other Jokes" : "All Jokes"}</Text>
      <FlatList
        data={otherJokes}
        keyExtractor={(item) => item.id}
        renderItem={renderJokeItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No jokes found.</Text>}
        contentContainerStyle={otherJokes.length === 0 ? styles.centeredList : undefined}
        style={styles.flatListOtherJokes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    justifyContent: "flex-start",
  },
  topRightButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e86de",
    marginTop: 40,
    marginBottom: 18,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  jokeContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
    width: 300,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  jokeText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#333",
    textAlign: "center",
    marginBottom: 6,
  },
  submittedBy: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  emailText: {
    color: "#2e86de",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#888",
    fontStyle: "italic",
    marginBottom: 10,
    textAlign: "center",
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: "#e74c3c",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  centeredList: {
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  flatListYourJokes: {
    flexGrow: 0,
    marginBottom: 24,
    minHeight: 100,
  },
  flatListOtherJokes: {
    flexGrow: 0,
    minHeight: 100,
  },
});
