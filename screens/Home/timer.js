import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Layout } from '@ui-kitten/components';
import Clock from './clock';
import StartStopButton from './start_stop_button';
import isLoggedIn from '../../utils/isLoggedIn';
import { startSession, stopSession } from './sessions';
import { useFocusEffect } from '@react-navigation/native';
import {
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, firestore } from '../../firebase';
import CatMotivationComponent from './Components/cat_motivation';
import SliderComponent from './Components/slider';
import CatCash from './Components/cat_cash';

const Timer = ({}) => {
  const [timer, setTimer] = useState(1500000);
  const [inProgress, setInProgress] = useState(false);
  const [refresh, setRefresh] = useState(1);
  const [catCash, setCatCash] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn()) {
        getDoc(doc(firestore, 'users', auth.currentUser.uid))
          .then((userDoc) => {
            return userDoc.data().current_session;
          })
          .then((sessionId) => {
            updateDoc(doc(firestore, 'sessions', sessionId), {
              check_time: serverTimestamp(),
            });
            return sessionId;
          })
          .then((sessionId) => {
            const unsubscribe = onSnapshot(
              doc(firestore, 'sessions', sessionId),
              (sessionDoc) => {
                if (
                  !sessionDoc.data().is_completed &&
                  sessionDoc.data().check_time !== null
                ) {
                  const data = sessionDoc.data();
                  const durationLeft =
                    data.duration -
                    data.check_time.seconds +
                    data.start_time.seconds;
                  if (!inProgress) {
                    setInProgress(true);
                    setTimer(durationLeft * 1000);
                  }
                  if (data.successfully_completed != null) {
                    console.log(data.successfully_completed);
                  }
                } else if (sessionDoc.data().is_completed) {
                  if (sessionDoc.data().successfully_completed) {
                    setInProgress(false);
                    completeAlert();
                  } else {
                    setInProgress(false);
                    incompleteAlert();
                  }
                } else {
                  setInProgress(false);
                }
              },
              (error) => {
                console.log(error.code);
              }
            );
            return () => unsubscribe();
          })
          .catch((e) => console.log(e.code));
      }
    }, [refresh])
  );

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn()) {
        getDoc(doc(firestore, 'users', auth.currentUser.uid))
          .then((userDoc) => {
            return userDoc.data().current_session;
          })
          .then((sessionId) => {
            const unsubscribe = onSnapshot(
              doc(firestore, 'sessions', sessionId),
              (sessionDoc) => {
                if (sessionDoc.data().successfully_completed) {
                  console.log('popup alert');
                }
              },
              (error) => {
                console.log(error.code);
              }
            );
            return () => unsubscribe();
          });
      }
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn()) {
        const unsubscribe = onSnapshot(
          doc(firestore, 'users', auth.currentUser.uid),
          (userDoc) => {
            setCatCash(userDoc.data().cat_cash);
          },
          (error) => {
            console.log(error.code);
          }
        );
        return () => unsubscribe();
      }
    }, [])
  );

  useEffect(() => {
    if (inProgress) {
      const interval = setInterval(() => {
        setTimer((timer) => {
          if (timer <= 1000) {
            clearInterval(interval);
            stopSession().then(() => {
              setTimer(0);
              setInProgress(false);
            });
          } else {
            return timer - 1000;
          }
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [inProgress]);

  const start = () => {
    startSession(timer / 1000).then(() => {
      setInProgress(true);
    });
    setRefresh((x) => x + 1);
  };

  const stop = () => {
    stopSession().then(() => {
      setTimer(0);
      setInProgress(false);
    });
    incompleteAlert();
  };

  const completeAlert = () =>
    Alert.alert(
      'Session Complete',
      'Congratulations, you have been awarded cat cash for your hardwork!',
      [
        {
          text: 'Continue',
          onPress: () => setRefresh((x) => x + 1),
          style: 'cancel',
        },
      ]
    );

  const incompleteAlert = () =>
    Alert.alert(
      'Session Incomplete',
      'Complete session entirely to get cat cash.',
      [
        {
          text: 'Continue',
          onPress: () => setRefresh((x) => x + 1),
          style: 'cancel',
        },
      ]
    );

  return (
    <Layout style={styles.container}>
      <CatCash catCash={catCash} />
      <CatMotivationComponent inProgressStatus={inProgress} />
      <Layout
        style={[
          styles.timerWrapper,
          { justifyContent: inProgress ? 'flex-start' : 'center' },
        ]}
      >
        <Clock interval={timer} style={styles.time} />
        <SliderComponent
          inProgressStatus={inProgress}
          timer={timer}
          setTimer={setTimer}
        />
        <StartStopButton
          progress={inProgress}
          style={styles.button}
          start={start}
          stop={stop}
        />
      </Layout>
    </Layout>
  );
};

export default Timer;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    alignItems: 'center',
  },
  slider: {
    width: 250,
    height: 50,
  },
  time: {
    fontSize: 76,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    width: 80,
  },
  timerWrapper: {
    flex: 2,
    alignItems: 'center',
  },
});
