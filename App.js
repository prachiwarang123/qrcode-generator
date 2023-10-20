import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

export default function App() {
  const [selectedItem, setSelectedItem] = useState("");
  const [imgPressed, setImgPressed] = useState(false);
  const [textVal, setTextVal] = useState("");

  const qrcodeRef = useRef();

  const cardPressed = (val) => {
    setSelectedItem(val);
    if (val == "Image") {
      setImgPressed(true);
      return;
    }
    setImgPressed(false);
  };
  const shareHandlePress = async () => {
    let fileUri;
    if (!textVal && !imgPressed) {
      Alert.alert("", "Please enter text");
      return;
    }

    try {
      qrcodeRef.current.toDataURL((data) => {
        fileUri = `${FileSystem.cacheDirectory}temp.png`;
        FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        Sharing.shareAsync(fileUri)
          .then((res) => console.log(res, "succ"))
          .catch((err) => console.log(err, "err"));
      });
    } catch (error) {
      console.error("Error generating QR code SVG:", error);
    }
  };

  const handleDownload = async () => {
    let fileUri;
    if (!textVal) Alert.alert("", "Please enter text");

    if (textVal) {
      try {
        qrcodeRef.current.toDataURL((data) => {
          fileUri = `${FileSystem.cacheDirectory}temp.png`;
          FileSystem.writeAsStringAsync(fileUri, data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          FileSystem.getContentUriAsync(fileUri)
            .then((contentUri) => {
              if (contentUri) {
                DocumentPicker.getDocumentAsync({
                  copyToCacheDirectory: false,
                })
                  .then((result) => {
                    if (result.type === "success") {
                      const { uri } = result;
                      console.log("File URI:", uri);
                    }
                  })
                  .catch((error) => {
                    console.error("DocumentPicker error:", error);
                  });
              }
            })
            .catch((error) => {
              console.error("getContentUriAsync error:", error);
            });
        });
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <View style={styles.container}>
      <Text
        style={{
          fontWeight: "600",
          fontSize: 18,
          fontFamily: "sans-serif",
          marginBottom: selectedItem ? 30 : null,
        }}
      >
        Generate QR Code {selectedItem && `For ${selectedItem}`}
      </Text>
      <ScrollView>
        {!selectedItem && (
          <>
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => cardPressed("Text")}
            >
              <Image
                style={styles.userImage}
                source={{
                  uri: "https://cdn2.iconfinder.com/data/icons/flaticons-solid/16/text-1-512.png",
                }}
              />
              <View style={styles.userCardRight}>
                <Text style={{ fontSize: 18, fontWeight: "500" }}>Text</Text>
                <Text>Click here to generate qr code</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userCard}
              onPress={() => cardPressed("Url")}
            >
              <Image
                style={styles.userImage}
                source={{
                  uri: "https://cdn2.iconfinder.com/data/icons/file-format-icons-4/201/Untitled-47-512.png",
                }}
              />
              <View style={styles.userCardRight}>
                <Text style={{ fontSize: 18, fontWeight: "500" }}>Url</Text>
                <Text>Click here to generate qr code</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userCard}
              onPress={() => cardPressed("Facebook")}
            >
              <Image
                style={styles.userImage}
                source={{
                  uri: "https://pngimg.com/uploads/facebook_logos/facebook_logos_PNG19757.png",
                }}
              />
              <View style={styles.userCardRight}>
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  Facebook
                </Text>
                <Text>Click here to generate qr code</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userCard}
              onPress={() => cardPressed("Instagram")}
            >
              <Image
                style={styles.userImage}
                source={{
                  uri: "https://www.freepngimg.com/download/logo/62372-computer-neon-instagram-icons-hd-image-free-png.png",
                }}
              />
              <View style={styles.userCardRight}>
                <Text style={{ fontSize: 18, fontWeight: "600" }}>
                  Instagram
                </Text>
                <Text>Click here to generate qr Code</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userCard}
              onPress={() => cardPressed("Image")}
            >
              <Image
                style={styles.userImage}
                source={{
                  uri: "https://cdn.onlinewebfonts.com/svg/img_128264.png",
                }}
              />
              <View style={styles.userCardRight}>
                <Text style={{ fontSize: 18, fontWeight: "500" }}>Image</Text>
                <Text>Click here to generate qr code</Text>
              </View>
            </TouchableOpacity>
          </>
        )}
        {selectedItem && (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              flex: 1,
            }}
          >
            {!imgPressed && (
              <TextInput
                style={styles.input}
                placeholder="Enter Text Here"
                onChangeText={(val) => setTextVal(val)}
              />
            )}

            <QRCode
              value={
                imgPressed
                  ? "https://i.ibb.co/pj6bgwy/cover-13.jpg"
                  : textVal || "Enter Text"
              }
              size={190}
              getRef={qrcodeRef}
            />

            <View style={styles.button}>
              <Button title="Share Qr Code" onPress={shareHandlePress} />
            </View>

            {/*<View style={styles.button}>
              <Button
                title="Download"
                style={{ padding: 50 }}
                onPress={handleDownload}
              />
            </View>*/}
            <View style={styles.button}>
              <Button title="Go Back" onPress={() => setSelectedItem("")} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: "10%",
  },
  searchView: {
    display: "flex",
    flexDirection: "row",
  },
  inputView: {
    flex: 1,
    height: 40,
    backgroundColor: "#dfe4ea",
    paddingHorizontal: 10,
    borderRadius: 6,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 18,
  },
  userCard: {
    backgroundColor: "#fafafa",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginTop: 20,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  userCardRight: {
    paddingHorizontal: 20,
  },
  messageBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBoxText: {
    fontSize: 20,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: 50,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginBottom: 30,
  },
  button: {
    marginTop: 30,
    width: "100%",
  },
});
