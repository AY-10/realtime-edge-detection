cmake_minimum_required(VERSION 3.10.2)
project("native-lib")

# Set OpenCV path - ADJUST THIS PATH to your OpenCV SDK location
# Download OpenCV Android SDK from: https://opencv.org/releases/
set(OpenCV_DIR ${CMAKE_SOURCE_DIR}/../../../opencv/sdk/native/jni)

find_package(OpenCV REQUIRED)

add_library(native-lib SHARED native-lib.cpp)

include_directories(${OpenCV_INCLUDE_DIRS})

target_link_libraries(native-lib
    ${OpenCV_LIBS}
    log
    android
)
