#include <jni.h>
#include <opencv2/opencv.hpp>
#include <android/log.h>
#include <vector>

#define TAG "NativeLib"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG, __VA_ARGS__)

extern "C"
JNIEXPORT jbyteArray JNICALL
Java_com_example_realtime_NativeBridge_processFrame(JNIEnv *env, jclass clazz,
                                                   jbyteArray input_, jint width, jint height) {
    jsize len = env->GetArrayLength(input_);
    jbyte* input = env->GetByteArrayElements(input_, NULL);

    if (input == nullptr) {
        LOGE("Failed to get input array elements");
        return nullptr;
    }

    try {
        // input: RGBA (width * height * 4)
        cv::Mat imgRGBA(height, width, CV_8UC4, reinterpret_cast<unsigned char*>(input));
        
        // Convert RGBA to BGR for OpenCV processing
        cv::Mat imgBGR;
        cv::cvtColor(imgRGBA, imgBGR, cv::COLOR_RGBA2BGR);

        // Convert to grayscale
        cv::Mat gray;
        cv::cvtColor(imgBGR, gray, cv::COLOR_BGR2GRAY);

        // Apply Gaussian blur to reduce noise
        cv::Mat blurred;
        cv::GaussianBlur(gray, blurred, cv::Size(5, 5), 1.5);

        // Apply Canny edge detection
        cv::Mat edges;
        double lowThresh = 50;
        double highThresh = 150;
        cv::Canny(blurred, edges, lowThresh, highThresh);

        // Convert edges (single channel) -> RGBA output
        cv::Mat outRGBA;
        cv::cvtColor(edges, outRGBA, cv::COLOR_GRAY2RGBA);

        // Prepare jbyteArray to return
        int outLen = outRGBA.total() * outRGBA.elemSize();
        jbyteArray outArr = env->NewByteArray(outLen);
        
        if (outArr == nullptr) {
            LOGE("Failed to allocate output array");
            env->ReleaseByteArrayElements(input_, input, JNI_ABORT);
            return nullptr;
        }

        env->SetByteArrayRegion(outArr, 0, outLen, reinterpret_cast<jbyte*>(outRGBA.data));
        env->ReleaseByteArrayElements(input_, input, JNI_ABORT);

        return outArr;
    } catch (cv::Exception& e) {
        LOGE("OpenCV exception: %s", e.what());
        env->ReleaseByteArrayElements(input_, input, JNI_ABORT);
        return nullptr;
    }
}
