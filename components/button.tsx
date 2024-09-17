import React, { PropsWithChildren } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";


type ButtonProps = PropsWithChildren<{
  type?: "primary" | "secondary";
  onClick?: () => void;
  disable?: boolean;
  iconName?: string; // Name of the FontAwesome icon
  iconSize?: number; // Size of the icon
  iconColor?: string; // Color of the icon
}>;

const Button: React.FC<ButtonProps> = ({
  type = "primary",
  onClick,
  disable,
  iconName,
  iconSize = 20,
  iconColor = "#fff",
  children,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        type === "primary" ? styles.primaryButton : styles.secondaryButton,
        disable ? styles.disabledButton : {},
      ]}
      onPress={!disable ? onClick : undefined}
      activeOpacity={disable ? 1 : 0.7} // Disable click effect if the button is disabled
    >
     
        <Text style={styles.text}>{children}</Text>
    
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
    flexDirection: "row", // Aligns icon and text horizontally
  } as ViewStyle,
  primaryButton: {
    backgroundColor: "#b59906",
  } as ViewStyle,
  secondaryButton: {
    backgroundColor: "#034c2e",
  } as ViewStyle,
  disabledButton: {
    backgroundColor: "#cccccc",
  } as ViewStyle,
  text: {
    color: "#fff",
    fontWeight: "bold",
  } as TextStyle,
  content: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,
  icon: {
    marginRight: 8, // Space between the icon and text
  } as ViewStyle,
});
