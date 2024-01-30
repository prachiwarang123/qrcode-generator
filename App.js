import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
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
import TestPopUp from "./TestPopUp";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import mime from "mime";
import axios from "axios";
import { Button as MaterialButton } from "react-native-paper";

const { width } = Dimensions.get("screen");
const { height } = Dimensions.get("screen");
export default function App() {
  const [selectedItem, setSelectedItem] = useState("");
  const [imgPressed, setImgPressed] = useState(false);
  const [textVal, setTextVal] = useState("");
  const [img, setImg] = useState("");
  const [loading, setLoading] = useState(false);

  const qrcodeRef = useRef();

  const pickImage = async (maxWidth, maxHeight) => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      if (res.cancelled) {
        return {};
      }
      // resize image if too large
      const resizedImage =
        res.height > maxHeight && res.width > maxWidth
          ? await ImageManipulator.manipulateAsync(
              res.uri,
              [{ resize: { width: maxWidth, height: maxHeight } }],
              { compress: 1 }
            )
          : res;

      return resizedImage;
    } catch (error) {
      if (error.message !== "canceled") throw new Error(error);
    }
  };

  const IMGBBuploadImage = async (image) => {
    const newImageUri = "file:///" + image.split("file:/").join("");

    const formData = new FormData();
    formData.append("image", {
      uri: newImageUri,
      type: mime.getType(newImageUri),
      name: newImageUri.split("/").pop(),
    });
    formData.append("key", "b6039e9bcebd091e652fb70408d6bc25");
    try {
      const { data } = await axios.post(
        "https://api.imgbb.com/1/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (!data) {
        return { error: "There was an error" };
      }
      return { url: data.data.url };
    } catch (error) {
      return { error: error.message };
    }
  };

  const handlePickImage = async () => {
    try {
      const { uri } = await pickImage(750, 1000);
      uri && setLoading(true);
      const { url, error: imageError } = await IMGBBuploadImage(uri);
      if (imageError) {
        Alert.alert("Error", "There was an error");
        return;
      } else {
        setImg(uri);
        setTextVal(url);
      }
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  };

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
  let imgurl = "https://i.ibb.co/pj6bgwy/cover-13.jpg";
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
            {!imgPressed && (
              <QRCode
                value={textVal || "Enter Text"}
                size={190}
                getRef={qrcodeRef}
              />
            )}
            {imgPressed && (
              <View style={styles.imgcontainer}>
                <View
                  style={{ width: (width * 50) / 100, alignSelf: "center" }}
                >
                  {img && (
                    <Image
                      style={{
                        width: (width * 40) / 100,
                        height: (width * 40) / 100,
                      }}
                      source={{
                        uri: img,
                      }}
                    />
                  )}
                  {!img && (
                    <View
                      style={{
                        width: (width * 40) / 100,
                        height: (width * 40) / 100,
                        borderWidth: 1,
                        borderColor: "silver",
                        borderRadius: 6,
                        justifyContent: "center",
                      }}
                    >
                      <View style={{ padding: 15 }}>
                        <MaterialButton
                          onPress={handlePickImage}
                          loading={loading}
                          mode="contained"
                        >
                          Upload
                        </MaterialButton>
                      </View>
                    </View>
                  )}
                </View>

                <View
                  style={{ width: (width * 50) / 100, alignSelf: "center" }}
                >
                  <QRCode
                    value={textVal || "No Text"}
                    size={(width * 40) / 100}
                    getRef={qrcodeRef}
                  />
                </View>
              </View>
            )}

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
        {img && (
          <View style={styles.button}>
            <Button title="Cancel" onPress={() => setImg("")} />
          </View>
        )}
      </ScrollView>
      {/*<TestPopUp />*/}
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
  imgcontainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
});
