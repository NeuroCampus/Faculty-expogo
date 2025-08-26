// Gesture handler must be at top for React Navigation
import 'react-native-gesture-handler';
// Reanimated needs to be imported at the top-level before any other code
import 'react-native-reanimated';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
