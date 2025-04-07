import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useHapticFeedback } from "../hooks/useAnimations";

const { width } = Dimensions.get("window");

type TabIconProps = {
  name: string;
  color: string;
  size: number;
  focused: boolean;
};

const TabIcon: React.FC<TabIconProps> = ({ name, color, size, focused }) => {
  // When focused, display filled icons, otherwise outline
  const iconName = `${name}${focused ? "" : "-outline"}`;

  return <Ionicons name={iconName as any} size={size} color={color} />;
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const { triggerSelection } = useHapticFeedback();

  // Track indicator position for animation
  const indicatorPosition = useSharedValue(0);

  // Update indicator position when active tab changes
  React.useEffect(() => {
    const tabWidth = width / state.routes.length;
    const newPosition = state.index * tabWidth;
    indicatorPosition.value = withTiming(newPosition, { duration: 250 });
  }, [state.index]);

  // Animated style for the indicator
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundCard,
          borderTopColor: theme.border,
        },
      ]}
    >
      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: width / state.routes.length,
            backgroundColor: theme.primaryLight,
          },
          indicatorStyle,
        ]}
      />

      {/* Tab buttons */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;

        const isFocused = state.index === index;

        // Get icon name based on route
        let iconName: string;
        switch (route.name) {
          case "Scan":
            iconName = "scan";
            break;
          case "Impact":
            iconName = "leaf";
            break;
          case "Community":
            iconName = "people";
            break;
          case "Resources":
            iconName = "map";
            break;
          default:
            iconName = "ellipsis-horizontal";
        }

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            triggerSelection();
            // @ts-ignore - The navigation type in BottomTabBarProps needs fixing
            navigation.navigate(route.name, { merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        // Scale animation for tab items
        const scale = useSharedValue(isFocused ? 1 : 0.92);

        React.useEffect(() => {
          scale.value = withTiming(isFocused ? 1 : 0.92, { duration: 200 });
        }, [isFocused]);

        const tabItemStyle = useAnimatedStyle(() => {
          return {
            transform: [{ scale: scale.value }],
            opacity: interpolate(
              scale.value,
              [0.92, 1],
              [0.8, 1],
              Extrapolate.CLAMP
            ),
          };
        });

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <Animated.View style={[styles.tabItem, tabItemStyle]}>
              <TabIcon
                name={iconName}
                color={isFocused ? theme.primary : theme.textTertiary}
                size={24}
                focused={isFocused}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? theme.primary : theme.textTertiary,
                    marginTop: 4,
                  },
                ]}
              >
                {label as string}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 65,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  indicator: {
    position: "absolute",
    top: 0,
    height: "100%",
    borderRadius: 8,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default CustomTabBar;
