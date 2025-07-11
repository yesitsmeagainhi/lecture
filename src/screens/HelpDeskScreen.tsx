// ─────────────────────────────────────────────────────────
//  src/screens/HelpDeskScreen.tsx
// ─────────────────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';

export default function HelpDeskScreen() {
  return (
    <View style={s.root}>
      <Text style={s.title}>🛟  Help Desk</Text>

      <Text style={s.body}>
        • FAQ & How-To Guides (coming soon){'\n'}
        • Contact us on WhatsApp or Email if you need assistance.
      </Text>

      <TouchableOpacity
        style={s.btn}
        onPress={() => Linking.openURL('https://wa.me/919876543210')}
      >
        <Text style={s.btnTxt}>Chat on WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Linking.openURL('mailto:support@abs.edu.in')}
      >
        <Text style={s.mail}>support@abs.edu.in</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root : { flex:1, justifyContent:'center', alignItems:'center', padding:24 },
  title: { fontSize:22, fontWeight:'600', marginBottom:14 },
  body : { fontSize:15, textAlign:'center', marginBottom:30, lineHeight:22 },
  btn  : {
    backgroundColor:'#004e92',
    paddingHorizontal:24,
    paddingVertical:12,
    borderRadius:24,
    marginBottom:20,
  },
  btnTxt: { color:'#fff', fontWeight:'600', fontSize:15 },
  mail : { color:'#2563eb', textDecorationLine:'underline', fontSize:15 },
});
