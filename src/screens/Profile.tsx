import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Title, Card, Button } from '../ui'
import { clearToken } from '../services/storage'

export default function Profile({ navigation }: any){
  return (
    <View style={styles.wrap}>
      <Title>Profile</Title>
      <View style={{height:12}}/>
      <Card>
        <Text>We can render /users/me info here later.</Text>
      </Card>
      <View style={{height:12}}/>
      <Button title="Log out" onPress={()=>{ clearToken(); navigation.replace('Auth') }} />
    </View>
  )
}

const styles = StyleSheet.create({ wrap:{ flex:1, backgroundColor:'#fff', padding:16 } })
