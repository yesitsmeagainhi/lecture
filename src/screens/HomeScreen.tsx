// ─────────────────────────────────────────────────────────
//  HomeScreen.tsx  –  Student dashboard
// ─────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  StyleSheet, ActivityIndicator, Image, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BannerSlider, { BANNER_HEIGHT } from '../components/BannerSlider';
import { useAuth }   from '../contexts/AuthContext';
import { fetchBanners } from '../services/lectures';

/* icons */
const ICON_TODAY    = require('../../assets/today.png');
const ICON_TOMORROW = require('../../assets/tomorrow.png');
const ICON_ALERT    = require('../../assets/alert.png');

/* palette */
const PALETTE = {
  blue:'#004e92', textMain:'#1a1a1a', textMute:'#686868',
  surface:'#ffffff', bg:'#f2f5fa',
};
const shadow = (e=4)=>Platform.select({
  ios:{ shadowColor:'#000',shadowOffset:{width:0,height:e/2},
        shadowOpacity:0.08,shadowRadius:e },
  android:{ elevation:e },
});

export default function HomeScreen() {
  /* navigation via hook (no props) */
  const navigation = useNavigation();
  const { student, logOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [banners,setBanners] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      try {
        const rows   = await fetchBanners();
        const active = rows.filter(r => (r.isActive ?? 'true').toLowerCase()==='true');
        setBanners(active);
      } catch(err){ console.warn('Banner fetch failed:',err); }
      finally{ setLoading(false); }
    })();
  },[]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={PALETTE.blue} />

      {/* HEADER */}
      <View style={[styles.header,{paddingTop:insets.top}]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcome}>Welcome back 👋</Text>
            <Text style={styles.userName}>{student?.name ?? 'Student'}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={()=>{
              logOut();
              navigation.reset({ index:0, routes:[{ name:'Login' }]});
            }}>
            <Text style={styles.logoutTxt}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom:24}}>
        <View style={styles.body}>

          {/* BANNERS */}
          <View style={styles.bannerFrame}>
            {loading
              ? <ActivityIndicator size="large" color={PALETTE.blue} style={{flex:1}}/>
              : <BannerSlider banners={banners}/>}
          </View>

          {/* MENU */}
          <View style={styles.menuRow}>
            <MenuCard
              image={ICON_TODAY} label="Today's Session" hint="View today's schedule"
              style={{marginRight:8}}
              onPress={()=>navigation.navigate('TodayLectures')}
            />
            <MenuCard
              image={ICON_TOMORROW} label="Tomorrow" hint="Tomorrow sessions update"
              style={{marginLeft:8}}
              onPress={()=>navigation.navigate('TomorrowLectures')}
            />
          </View>

          <MenuCard
            image={ICON_ALERT} label="Important Announcements" hint="Don't miss any updates"
            style={{marginTop:16}}
            onPress={()=>navigation.navigate('ImportantAnnouncement')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* card component */
function MenuCard({ image,label,hint,onPress,style }){
  return(
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.menuCard,style]}>
      <View style={styles.cardInner}>
        <Image source={image} style={styles.cardIcon}/>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardHint}>{hint}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* styles */
const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:PALETTE.bg},
  header:{
    backgroundColor:PALETTE.blue,
    borderBottomLeftRadius:24,borderBottomRightRadius:24,
    paddingHorizontal:20,paddingBottom:20,...shadow(6),
  },
  headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  welcome:{color:'#cfe3ff',fontSize:15},
  userName:{color:'#fff',fontSize:22,fontWeight:'700',marginTop:2},
  logoutBtn:{
    borderWidth:1,borderColor:'rgba(255,255,255,0.4)',
    paddingHorizontal:16,paddingVertical:8,
    borderRadius:20,backgroundColor:'rgba(255,255,255,0.18)',
  },
  logoutTxt:{color:'#fff',fontWeight:'600'},
  scroll:{flex:1}, body:{paddingHorizontal:18,paddingTop:26},
  bannerFrame:{width:'100%',height:BANNER_HEIGHT,borderRadius:18,overflow:'hidden',
               backgroundColor:'#dcdcdc',...shadow(3)},
  menuRow:{flexDirection:'row',marginTop:24},
  menuCard:{flex:1,backgroundColor:PALETTE.surface,borderRadius:16,
            paddingVertical:26,paddingHorizontal:16,...shadow(4)},
  cardInner:{alignItems:'center'},
  cardIcon:{width:40,height:40,marginBottom:12,resizeMode:'contain'},
  cardLabel:{fontSize:16,fontWeight:'600',color:PALETTE.textMain},
  cardHint:{fontSize:13,color:PALETTE.textMute,marginTop:4,textAlign:'center'},
});
