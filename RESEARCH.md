# RESEARCH.md — Rocket Food Delivery Mobile App

---

## 1. Native vs Cross-Platform Mobile Applications

### Native Applications

A native mobile application is built specifically for one operating system using that platform's official programming language and tools.

- **iOS native** apps are written in Swift or Objective-C using Apple's Xcode development environment
- **Android native** apps are written in Kotlin or Java using Google's Android Studio

Because native apps are built for one platform only, they have direct access to the device's hardware and operating system features — camera, GPS, push notifications, biometrics, and anything else the OS exposes. The code runs as close to the hardware as possible, which typically means the best possible performance and the most responsive UI.

The tradeoff is that you need to build and maintain two completely separate codebases to support both iOS and Android. If you want to add a feature or fix a bug, you write it twice — once for each platform — in different languages.

**When native makes sense:**
- The app has very high performance requirements (games, AR, real-time video)
- The app needs deep, cutting-edge access to device hardware
- The team has the resources to maintain two separate codebases

---

### Cross-Platform Applications

A cross-platform mobile application is built using a single shared codebase that runs on both iOS and Android.

The developer writes the code once, and a framework handles translating that code into something that works on each platform. Different frameworks handle this translation differently:

- **React Native** (used in this project) writes JavaScript/TypeScript components that are compiled into real native UI components at runtime — so the output is not a website inside an app, it's actual native views
- **Flutter** uses the Dart language and draws its own UI components using a custom rendering engine, bypassing native UI components entirely
- **Ionic** wraps a web application (HTML/CSS/JS) inside a native container — the UI is essentially a website running inside the app

**When cross-platform makes sense:**
- The team wants to ship on both iOS and Android without doubling development time
- The app's features don't require the absolute latest hardware access
- Consistency between platforms is a priority
- Budget or team size is a consideration

**The main tradeoff:**
Cross-platform apps can sometimes lag behind native apps when a new OS feature is released, because the framework needs time to add support for it. Performance is also slightly lower than native in very demanding use cases, though for most business apps the difference is not noticeable to users.

---

## 2. React Native vs React

### What they share

React Native and React (also called React.js or ReactJS) are both built by Meta (Facebook) and share the same core philosophy: building UIs out of reusable components, managing state with hooks like `useState` and `useEffect`, and using JSX syntax to describe what the UI should look like.

If you know React, picking up React Native is significantly easier than learning a completely new framework — the component model, lifecycle, hooks, and state management patterns are identical.

---

### React (ReactJS)

React is a JavaScript library for building **web** user interfaces. It runs in the browser.

- Components render to HTML elements: `<div>`, `<p>`, `<button>`, `<img>`, etc.
- Styling is done with CSS — either stylesheets, CSS modules, or CSS-in-JS libraries
- Navigation is handled by libraries like React Router
- It runs inside a web browser (Chrome, Firefox, Safari, etc.)
- Output is a website or web application

---

### React Native

React Native is a framework for building **mobile** applications for iOS and Android. It runs on a device or simulator.

- Components render to native mobile UI elements instead of HTML. For example:
  - Instead of `<div>` → use `<View>`
  - Instead of `<p>` → use `<Text>`
  - Instead of `<img>` → use `<Image>`
  - Instead of `<button>` → use `<TouchableOpacity>` or `<Pressable>`
  - Instead of `<ul>` with mapped items → use `<FlatList>`
- Styling is done with JavaScript `StyleSheet` objects — similar to CSS but using camelCase property names and no units (no `px`, no `em`)
- Navigation is handled by libraries like React Navigation or expo-router (used in this project)
- It runs on iOS and Android devices or simulators
- Output is a mobile application

---

### How this project uses both concepts

This project uses React Native with Expo. The component structure, hooks, and state management are identical to what you would use in a React web project. The difference is entirely in what those components render to — instead of HTML in a browser, they render to native iOS and Android views on a mobile device.

Expo adds a layer on top of React Native that handles the build process, provides pre-built access to device features (camera, storage, etc.), and allows testing on a physical device by simply scanning a QR code with the Expo Go app — without needing to compile and install a full native app.
