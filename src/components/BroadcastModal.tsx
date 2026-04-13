import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useLoginStore from '../screen/AuthScreen/login/useLoginStore';
import { useReadBroadcastMutation } from '../services/profile.api';
import { renderAnchors } from './ClickAbleText';
// import useLoginStore from '../path/to/login.store';

const BroadcastModal = ({}) => {
  const {broadcastModal, setBroadcastModal} = useLoginStore();
  const [readBroadcast] = useReadBroadcastMutation();

  if (!broadcastModal.visible) {
    return null;
  }

  return (
    <Modal
      transparent
      //   visible={true}
      visible={broadcastModal.visible}
      animationType="fade"
      onRequestClose={async () => {
        try {
          await readBroadcast({}).unwrap();
          console.log('Broadcast marked as read');
          setBroadcastModal({
            name: '',
            description: '',
            visible: false,
          });
        } catch (err) {
          setBroadcastModal({
            name: '',
            description: '',
            visible: false,
          });
          console.log('readBroadcast API error:', err?.data?.message);
        }
      }}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{broadcastModal.name}</Text>
          {renderAnchors(broadcastModal.description, styles.desc)}
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              try {
                await readBroadcast({}).unwrap();
                console.log('Broadcast marked as read');
                setBroadcastModal({
                  name: '',
                  description: '',
                  visible: false,
                });
              } catch (err) {
                setBroadcastModal({
                  name: '',
                  description: '',
                  visible: false,
                });
                console.log('readBroadcast API error:', err?.data?.message);
              }
            }}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    elevation: 5,
  },
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  desc: {fontSize: 15, marginBottom: 20},
  button: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {color: '#fff', fontWeight: '600'},
});

export default BroadcastModal;
