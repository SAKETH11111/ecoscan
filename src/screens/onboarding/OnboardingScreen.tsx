import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

const { width, height } = Dimensions.get("window");

type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  image: React.ReactNode;
};

const OnboardingScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onboardingItems: OnboardingItem[] = [
    {
      id: "1",
      title: "Scan & Identify",
      description:
        "Simply scan any item with your camera to instantly identify how to properly recycle it.",
      image: (
        <View style={styles.imageContainer}>
          <Ionicons name="scan-outline" size={160} color={theme.primary} />
        </View>
      ),
    },
    {
      id: "2",
      title: "Track Your Impact",
      description:
        "See how your recycling habits positively affect the environment with beautiful visualizations.",
      image: (
        <View style={styles.imageContainer}>
          <Ionicons name="leaf-outline" size={160} color={theme.primary} />
        </View>
      ),
    },
    {
      id: "3",
      title: "Find Resources",
      description:
        "Locate nearby recycling centers and discover eco-friendly businesses in your area.",
      image: (
        <View style={styles.imageContainer}>
          <Ionicons name="map-outline" size={160} color={theme.primary} />
        </View>
      ),
    },
    {
      id: "4",
      title: "Join the Community",
      description:
        "Connect with like-minded individuals and participate in sustainability challenges.",
      image: (
        <View style={styles.imageContainer}>
          <Ionicons name="people-outline" size={160} color={theme.primary} />
        </View>
      ),
    },
  ];

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index: number) => {
    if (slidesRef.current) {
      slidesRef.current.scrollToIndex({ index });
    }
  };

  const nextSlide = () => {
    if (currentIndex < onboardingItems.length - 1) {
      scrollTo(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    navigation.navigate("Main" as never);
  };

  const renderDot = (index: number) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const dotWidth = scrollX.interpolate({
      inputRange,
      outputRange: [8, 20, 8],
      extrapolate: "clamp",
    });

    const dotOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        key={index.toString()}
        style={[
          styles.dot,
          {
            width: dotWidth,
            opacity: dotOpacity,
            backgroundColor: theme.primary,
          },
        ]}
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}
    >
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />

      <TouchableOpacity
        style={styles.skipButton}
        onPress={skipOnboarding}
        activeOpacity={0.7}
      >
        <Text style={[styles.skipText, { color: theme.textSecondary }]}>
          Skip
        </Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={slidesRef}
        data={onboardingItems}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Animated.View style={styles.imageWrapper}>
              {item.image}
            </Animated.View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {item.title}
              </Text>
              <Text
                style={[styles.description, { color: theme.textSecondary }]}
              >
                {item.description}
              </Text>
            </View>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.indicatorContainer}>
          {onboardingItems.map((_, index) => renderDot(index))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={nextSlide}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: theme.textInverse }]}>
            {currentIndex === onboardingItems.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 15,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  imageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    marginBottom: 100,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OnboardingScreen;
