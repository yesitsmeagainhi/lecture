// src/screens/ImportantAnnouncementScreen.tsx
// Works with your current Google Sheets format: id, title, message, date, image, video, More details
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import dayjs from 'dayjs';

import { useAuth } from '../contexts/AuthContext';
import { fetchImportantAnnouncements } from '../services/lectures';

const { width } = Dimensions.get('window');

/* Extract YouTube video ID from URL */
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/* Replace placeholders like {name} or {pendingFees} with student values */
function personalize(str = '', student: Record<string, any>) {
  if (!str || !student) return str;
  return str.replace(/{(\w+)}/g, (_, key) =>
    student?.[key] !== undefined ? String(student[key]) : `{${key}}`,
  );
}

/* Parse "More details" field for structured info */
function parseMoreDetails(moreDetails: string) {
  if (!moreDetails) return {};
  
  const details: any = {};
  
  // Split by common separators and parse key-value pairs
  const lines = moreDetails.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    // Try to parse "Key: Value" format
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '');
      
      switch (cleanKey) {
        case 'priority':
        case 'importance':
          details.priority = value;
          break;
        case 'category':
        case 'type':
          details.category = value;
          break;
        case 'deadline':
        case 'duedate':
        case 'lastdate':
          details.deadline = value;
          break;
        case 'location':
        case 'venue':
        case 'place':
          details.location = value;
          break;
        case 'contact':
        case 'email':
        case 'phone':
        case 'contactinfo':
          details.contact = value;
          break;
        case 'link':
        case 'url':
        case 'website':
          details.link = value;
          break;
        case 'author':
        case 'by':
        case 'postedby':
          details.author = value;
          break;
        default:
          // Keep original key for unknown fields
          details[cleanKey] = value;
      }
    } else {
      // If no colon, treat as general additional info
      if (!details.additionalInfo) details.additionalInfo = [];
      details.additionalInfo.push(line.trim());
    }
  });
  
  return details;
}

/* Priority Badge Component */
const PriorityBadge = ({ priority }: { priority?: string }) => {
  if (!priority) return null;
  
  const getPriorityStyle = () => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return { backgroundColor: '#fee2e2', color: '#dc2626', icon: '🔴' };
      case 'medium':
        return { backgroundColor: '#fef3c7', color: '#d97706', icon: '🟡' };
      case 'low':
        return { backgroundColor: '#dcfce7', color: '#16a34a', icon: '🟢' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#6b7280', icon: '⚪' };
    }
  };

  const style = getPriorityStyle();
  
  return (
    <View style={[styles.priorityBadge, { backgroundColor: style.backgroundColor }]}>
      <Text style={styles.priorityIcon}>{style.icon}</Text>
      <Text style={[styles.priorityText, { color: style.color }]}>
        {priority.toUpperCase()}
      </Text>
    </View>
  );
};

/* Category Badge Component */
const CategoryBadge = ({ category }: { category?: string }) => {
  if (!category) return null;
  
  const getCategoryIcon = () => {
    switch (category.toLowerCase()) {
      case 'academic':
      case 'academics':
        return '📚';
      case 'event':
      case 'events':
        return '🎉';
      case 'exam':
      case 'exams':
        return '📝';
      case 'fee':
      case 'fees':
        return '💰';
      case 'holiday':
      case 'holidays':
        return '🏖️';
      case 'urgent':
        return '⚠️';
      case 'general':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <View style={styles.categoryBadge}>
      <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
      <Text style={styles.categoryText}>{category}</Text>
    </View>
  );
};

/* YouTube Video Component */
const YouTubeVideo = ({ url, student }: { url: string; student: any }) => {
  const personalizedUrl = personalize(url, student);
  const videoId = getYouTubeVideoId(personalizedUrl);

  const handleVideoPress = () => {
    if (videoId) {
      const youtubeAppUrl = `youtube://watch?v=${videoId}`;
      const webUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      Linking.canOpenURL(youtubeAppUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(youtubeAppUrl);
          } else {
            return Linking.openURL(webUrl);
          }
        })
        .catch(() => {
          Linking.openURL(webUrl);
        });
    } else if (personalizedUrl) {
      Linking.openURL(personalizedUrl).catch(() => {
        Alert.alert('Error', 'Unable to open video link');
      });
    }
  };

  if (!videoId && !personalizedUrl) {
    return null;
  }

  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (
    <TouchableOpacity
      style={styles.videoContainer}
      onPress={handleVideoPress}
      activeOpacity={0.8}
    >
      {thumbnailUrl ? (
        <>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.videoThumbnail}
            resizeMode="cover"
          />
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶️</Text>
            </View>
            <Text style={styles.videoLabel}>Watch on YouTube</Text>
          </View>
        </>
      ) : (
        <View style={styles.genericVideoContainer}>
          <Text style={styles.videoIcon}>🎥</Text>
          <Text style={styles.videoText}>Open Video</Text>
          <Text style={styles.videoSubText}>Tap to play in browser</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function ImportantAnnouncementScreen() {
  const { student } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImportantAnnouncements()
      .then(setAnnouncements)
      .catch((error) => {
        console.error('Error fetching announcements:', error);
        Alert.alert(
          'Error',
          'Unable to load announcements from Google Sheet',
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004e92" />
        <Text style={styles.loadingText}>Loading announcements...</Text>
      </View>
    );
  }

  if (!announcements.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No important announcements 🎉</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {announcements.map((item, idx) => {
        // Parse the "More details" field
        const moreDetails = parseMoreDetails(item['More details'] || item.moredetails || '');
        
        return (
          <View key={`${item.id || 'ann'}-${idx}`} style={styles.card}>
            
            {/* Header with badges from More details */}
            {(moreDetails.category || moreDetails.priority) && (
              <View style={styles.headerRow}>
                <CategoryBadge category={moreDetails.category} />
                <PriorityBadge priority={moreDetails.priority} />
              </View>
            )}
            
            <Text style={styles.title}>
              {personalize(item.title, student)}
            </Text>

            {/* Date and Author */}
            <View style={styles.metaRow}>
              {!!item.date && (
                <Text style={styles.date}>
                  📅 {dayjs(item.date).format('DD MMM YYYY')}
                </Text>
              )}
              {!!moreDetails.author && (
                <Text style={styles.author}>
                  👤 {personalize(moreDetails.author, student)}
                </Text>
              )}
            </View>

            {/* Deadline if exists in More details */}
            {!!moreDetails.deadline && (
              <View style={styles.deadlineContainer}>
                <Text style={styles.deadlineLabel}>⏰ Deadline:</Text>
                <Text style={styles.deadlineText}>
                  {dayjs(moreDetails.deadline).format('DD MMM YYYY')}
                </Text>
              </View>
            )}

            {/* Optional image */}
            {!!item.image && (
              <Image
                source={{ uri: personalize(item.image, student) }}
                style={styles.media}
                resizeMode="cover"
                onError={(error) => {
                  console.log('Image load error:', error);
                }}
              />
            )}

            {/* YouTube/Video */}
            {!!item.video && (
              <YouTubeVideo url={item.video} student={student} />
            )}

            {/* Main Message */}
            {!!item.message && (
              <Text style={styles.body}>
                {personalize(item.message, student)}
              </Text>
            )}

            {/* Location from More details */}
            {!!moreDetails.location && (
              <View style={styles.locationContainer}>
                <Text style={styles.locationIcon}>More Info</Text>
                <Text style={styles.locationText}>
                  {personalize(moreDetails.location, student)}
                </Text>
              </View>
            )}

            {/* Contact Info from More details */}
            {!!moreDetails.contact && (
              <TouchableOpacity 
                style={styles.contactContainer}
                onPress={() => {
                  const contact = personalize(moreDetails.contact, student);
                  if (contact.includes('@')) {
                    Linking.openURL(`mailto:${contact}`);
                  } else if (contact.match(/^\+?[\d\s-()]+$/)) {
                    Linking.openURL(`tel:${contact}`);
                  } else {
                    Alert.alert('Contact Info', contact);
                  }
                }}
              >
                <Text style={styles.contactIcon}>
                  {moreDetails.contact.includes('@') ? '📧' : '📞'}
                </Text>
                <Text style={styles.contactText}>
                  {personalize(moreDetails.contact, student)}
                </Text>
              </TouchableOpacity>
            )}

            {/* Link from More details */}
            {!!moreDetails.link && (
              <TouchableOpacity 
                style={styles.linkContainer}
                onPress={() => Linking.openURL(personalize(moreDetails.link, student))}
              >
                <Text style={styles.linkIcon}>🔗</Text>
                <Text style={styles.linkText}>Open Link</Text>
              </TouchableOpacity>
            )}

            {/* Additional Info from More details */}
            {!!moreDetails.additionalInfo && moreDetails.additionalInfo.length > 0 && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>📋 Additional Details:</Text>
                {moreDetails.additionalInfo.map((info: string, i: number) => (
                  <Text key={i} style={styles.detailsText}>
                    • {personalize(info, student)}
                  </Text>
                ))}
              </View>
            )}
            
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },

  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  // Header and Badges
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },

  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0ea5e9',
  },

  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  priorityIcon: {
    fontSize: 10,
    marginRight: 4,
  },

  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004e92',
    marginBottom: 8,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  date: {
    color: '#6b7280',
    fontSize: 14,
  },

  author: {
    color: '#6b7280',
    fontSize: 14,
  },

  deadlineContainer: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },

  deadlineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 2,
  },

  deadlineText: {
    fontSize: 14,
    color: '#92400e',
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    color: '#333',
  },

  detailsContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  detailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 5,
  },

  detailsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 2,
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 6,
  },

  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  locationText: {
    fontSize: 14,
    color: '#059669',
    flex: 1,
  },

  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },

  contactIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  contactText: {
    fontSize: 14,
    color: '#1d4ed8',
    textDecorationLine: 'underline',
  },

  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },

  linkIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  linkText: {
    fontSize: 14,
    color: '#4f46e5',
    textDecorationLine: 'underline',
  },

  media: {
    width: width - 76,
    height: 200,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },

  // Video Styles
  videoContainer: {
    width: width - 76,
    height: 200,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden',
  },

  videoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  playIcon: {
    fontSize: 24,
    color: '#fff',
    marginLeft: 3,
  },

  videoLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  genericVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004e92',
  },

  videoIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  videoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },

  videoSubText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
});