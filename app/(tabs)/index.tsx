import {Image, StyleSheet, Clipboard} from 'react-native';
import * as Linking from 'expo-linking';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import * as Notifications from 'expo-notifications';
import {useEffect, useRef, useState} from "react"; // Optional
import {registerForPushNotificationsAsync} from '@/lib/utils'
import {SchedulableTriggerInputTypes} from "expo-notifications";

export default function HomeScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("")
  const [notification, setNotification] = useState<Notifications.Notification | null>(null)
  const notificationListener = useRef<Notifications.Subscription>()
  const responseListener = useRef<Notifications.Subscription>()

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token))

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      Notifications.cancelAllScheduledNotificationsAsync()
      setNotification(notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const jobUrl = response?.notification?.request?.content?.data?.url
      if (jobUrl) {
        Linking.openURL(`https://www.upwork.com${jobUrl}`)
      }
    })

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current)
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  const copyToClipboard = async () => {
    Clipboard.setString(expoPushToken || 'no token found');
  };

  const sendLocalTest = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got notification! 🔔",
        body: 'Here is the notification body',
        data: { url: 'https://www.upwork.com' },
      },
      trigger: {
        seconds: 2,
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{light: '#A1CEDC', dark: '#1D3D47'}}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Your push token below</ThemedText>
      </ThemedView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="subtitle"
          onPress={copyToClipboard}
        >{expoPushToken}</ThemedText>
      </ThemedView>

      {/*<ThemedView style={styles.titleContainer}>*/}
      {/*  <Button title={"Send test1"} onPress={sendLocalTest}/>*/}
      {/*</ThemedView>*/}

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
