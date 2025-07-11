// ─────────────────────────────────────────────────────────
//  src/screens/TeacherScreen.js  –  Teacher dashboard
// ─────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  StyleSheet, ActivityIndicator, Image, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import notifee, { AndroidImportance } from '@notifee/react-native';

import BannerSlider, { BANNER_HEIGHT } from '../components/BannerSlider';
import { useAuth }        from '../contexts/AuthContext';
import { fetchBanners }   from '../services/lectures';

/* icons */
const ICON_WEEK  = require('../../assets/week.png');
const ICON_ALERT = require('../../assets/alert.png');

/* palette / helpers */
const PALETTE = { blue:'#004e92', text:'#1a1a1a', textMute:'#686868',
                  surface:'#ffffff', bg:'#f2f5fa' };
const shadow = e=>Platform.select({
  ios:{shadowColor:'#000',shadowOffset:{width:0,height:e/2},
       shadowOpacity:0.08,shadowRadius:e},
  android:{elevation:e},
});

/* ── local helper: fire a local push to verify set-up ── */
async function sendTestNotification() {
  // 1 - make (or reuse) a channel that is HIGH importance
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default',
    importance: AndroidImportance.HIGH,   // <- HIGH == heads-up capable
  });

  // 2 - display
  await notifee.displayNotification({
    title: '🧪 Test push',
    body : 'If you can read this, notifications work! 🎉',
    android: {
      channelId,
      smallIcon: 'ic_notification',       // 24×24 white silhouette in /res/drawable/
      pressAction: { id: 'default' },     // makes banner tappable
    },
  });
}

export default function TeacherScreen() {
  const navigation = useNavigation();
  const { student, logOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [banners,setBanners] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    fetchBanners()
      .then(rows=>setBanners(rows.filter(r=>(r.isActive??'true').toLowerCase()==='true')))
      .catch(err=>console.warn('banner fetch failed',err))
      .finally(()=>setLoading(false));
  },[]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={PALETTE.blue} />

      {/* HEADER */}
      <View style={[s.header,{paddingTop:insets.top}]}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.welcome}>Welcome back 👋</Text>
            <Text style={s.user}>{student?.name ?? 'Teacher'}</Text>
          </View>

          <TouchableOpacity
            style={s.logoutBtn}
            onPress={()=>{
              logOut();
              navigation.reset({ index:0, routes:[{ name:'Login' }]});
            }}>
            <Text style={s.logoutTxt}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY */}
      <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingBottom:24}}>
        <View style={s.body}>

          {/* BANNERS */}
          <View style={s.bannerFrame}>
            {loading
              ? <ActivityIndicator size="large" color={PALETTE.blue} style={{flex:1}}/>
              : <BannerSlider banners={banners}/>}
          </View>

          {/* MENU */}
          <MenuCard
            image={ICON_WEEK} label="This Week" hint="7-day schedule"
            style={{marginTop:24}}
            onPress={()=>navigation.navigate('WeekLectures')}
          />
          <MenuCard
            image={ICON_ALERT} label="Important Announcements" hint="Don’t miss any updates"
            style={{marginTop:16}}
            onPress={()=>navigation.navigate('ImportantAnnouncement')}
          />

          {/* TEST NOTIFICATION BUTTON */}
          <TouchableOpacity style={s.testBtn} onPress={sendTestNotification}>
            <Text style={s.testTxt}>Send Test Notification</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* mini card */
function MenuCard({ image,label,hint,onPress,style }){
  return(
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[s.menuCard,style]}>
      <View style={s.cardInner}>
        <Image source={image} style={s.icon}/>
        <Text style={s.cardLabel}>{label}</Text>
        <Text style={s.cardHint}>{hint}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* styles */
const s=StyleSheet.create({
  root:{flex:1,backgroundColor:PALETTE.bg},
  header:{backgroundColor:PALETTE.blue,borderBottomLeftRadius:24,borderBottomRightRadius:24,
          paddingHorizontal:20,paddingBottom:20,...shadow(6)},
  headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  welcome:{color:'#cfe3ff',fontSize:15},
  user:{color:'#fff',fontSize:22,fontWeight:'700',marginTop:2},
  logoutBtn:{borderWidth:1,borderColor:'rgba(255,255,255,0.4)',
             paddingHorizontal:16,paddingVertical:8,borderRadius:20,
             backgroundColor:'rgba(255,255,255,0.18)'},
  logoutTxt:{color:'#fff',fontWeight:'600'},

  body:{paddingHorizontal:18,paddingTop:26},
  bannerFrame:{width:'100%',height:BANNER_HEIGHT,borderRadius:18,overflow:'hidden',
               backgroundColor:'#dcdcdc',...shadow(3)},

  menuCard:{backgroundColor:PALETTE.surface,borderRadius:16,paddingVertical:26,
            paddingHorizontal:16,...shadow(4)},
  cardInner:{alignItems:'center'},
  icon:{width:40,height:40,marginBottom:12,resizeMode:'contain'},
  cardLabel:{fontSize:16,fontWeight:'600',color:PALETTE.text},
  cardHint:{fontSize:13,color:PALETTE.textMute,marginTop:4,textAlign:'center'},

  /* new button */
  testBtn:{marginTop:24,alignSelf:'center',paddingHorizontal:24,paddingVertical:10,
          borderRadius:20,backgroundColor:PALETTE.blue,...shadow(2)},
  testTxt:{color:'#fff',fontWeight:'600',fontSize:14},
});
