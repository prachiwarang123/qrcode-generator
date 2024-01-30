import { Text, Provider, Portal, Modal, Button } from "react-native-paper";
import { Dimensions, View } from "react-native";
import React, { useState } from "react";

const { height } = Dimensions.get("screen");

const TestPopUp = () => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <View>
        <Button mode="contained" onPress={() => setVisible(true)}>
          Test Pop Up
        </Button>
      </View>

      <Provider>
        <Portal>
          <Modal
            visible={visible}
            onDismiss={() => setVisible(false)}
            contentContainerStyle={{
              minHeight: (height * 50) / 100,
              width: "100%",
              position: "absolute",
              bottom: 0,
              backgroundColor: "white",
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
            }}
          ></Modal>
        </Portal>
      </Provider>
    </>
  );
};

export default TestPopUp;
