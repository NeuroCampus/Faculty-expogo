import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({ username: z.string().min(1), password: z.string().min(1) });
type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' }
  });
  const { loginUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setLoading(true); setError(null);
    const res = await loginUser(data.username, data.password);
    if (!res.success) setError(res.message || 'Login failed');
    setLoading(false);
  };

  return (
    <View style={{ flex:1, padding:24, justifyContent:'center' }}>
            <Text style={{ fontSize:24, fontFamily:'System', marginBottom:24 }}>Faculty Login</Text>
      <Controller name="username" control={control} render={({ field:{ onChange, value } }) => (
        <TextInput placeholder="Username" autoCapitalize='none' value={value} onChangeText={onChange} style={{ borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:8, marginBottom:8 }} />
      )} />
      {errors.username && <Text style={{ color:'red', marginBottom:8 }}>Username required</Text>}
      <Controller name="password" control={control} render={({ field:{ onChange, value } }) => (
        <TextInput placeholder="Password" secureTextEntry value={value} onChangeText={onChange} style={{ borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:8, marginBottom:8 }} />
      )} />
      {errors.password && <Text style={{ color:'red', marginBottom:8 }}>Password required</Text>}
      {error && <Text style={{ color:'red', marginBottom:12 }}>{error}</Text>}
      <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={loading} style={{ backgroundColor:'#2563eb', padding:14, borderRadius:8, alignItems:'center' }}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff', fontFamily:'System' }}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}
