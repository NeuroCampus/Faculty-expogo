import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';
import * as Font from 'expo-font';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: 1
    }
  }
});

export default function App() {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          Inter: require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
        });
      } catch (e) {
        console.warn('Font load failed (placeholder fonts?) proceeding without custom fonts');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop:8 }}>Loading app...</Text>
      </View>
    );
  }
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
