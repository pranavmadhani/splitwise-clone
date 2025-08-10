import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { Card, Input, Button, Title, Subtitle } from '../ui'
import { api } from '../services/api'
import { setToken } from '../services/storage'
import { theme } from '../theme'

export default function Auth({ navigation }: any){
  const [mode, setMode] = useState<'login'|'register'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(){
    setLoading(true)
    try {
      if (mode==='register'){
        const r = await api.post('/auth/register', { email, name, password })
        setToken(r.data.access_token)
      } else {
        const r = await api.post('/auth/login', { email, password })
        setToken(r.data.access_token)
      }
      navigation.replace('Main')
    } catch (e:any){
      Alert.alert('Error', e?.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.wrap}>
      <Card style={{ width:'92%', maxWidth:500 }}>
        <Title>{mode==='register'?'Create account':'Welcome back'}</Title>
        <Subtitle>Split bills without the mess.</Subtitle>
        {mode==='register' && <Input label="Name" value={name} onChangeText={setName} />}
        <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title={loading ? 'Please wait...' : (mode==='register'?'Sign up':'Log in')} onPress={submit} />
        <View style={{height:10}}/>
        <Button title={mode==='register'?'Have an account? Log in':'Create account instead'} onPress={()=>setMode(mode==='register'?'login':'register')} kind="ghost" />
        <View style={{height:6}}/>
        <Button title="Skip (offline demo)" onPress={()=>{ setToken('demo'); navigation.replace('Main') }} kind="ghost" />
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex:1, alignItems:'center', justifyContent:'center', padding:16, backgroundColor: theme.colors.bg }
})
