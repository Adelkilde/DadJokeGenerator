import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "./screens/AuthScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import GeneratorScreen from "./screens/GeneratorScreen";
import JokeListScreen from "./screens/JokeListScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Generator">
        <Stack.Screen name="Generator" component={GeneratorScreen} />
        <Stack.Screen name="Login" component={AuthScreen} />
        <Stack.Screen name="JokeList" component={JokeListScreen} />
        <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
