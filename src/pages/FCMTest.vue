<template>
    <v-container class="fcm-test-page">
        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card>
                    <v-card-title class="text-h5 d-flex align-center">
                        <v-icon class="mr-2">mdi-bell-ring</v-icon>
                        Firebase Cloud Messaging Test
                    </v-card-title>

                    <v-card-text>
                        <v-alert v-if="!isSupported" type="error" class="mb-4">
                            <v-icon start>mdi-alert-circle</v-icon>
                            FCM is not supported in this browser. You need HTTPS and a modern
                            browser.
                        </v-alert>

                        <!-- Test Status -->
                        <v-card variant="outlined" class="mb-4">
                            <v-card-title class="text-h6">Current Status</v-card-title>
                            <v-card-text>
                                <div class="d-flex align-center mb-2">
                                    <v-icon :color="getStatusColor('permission')" class="mr-2">
                                        {{ getStatusIcon("permission") }}
                                    </v-icon>
                                    <span>Notification Permission: {{ notificationPermission }}</span>
                                </div>

                                <div class="d-flex align-center mb-2">
                                    <v-icon :color="getStatusColor('fcm')" class="mr-2">
                                        {{ getStatusIcon("fcm") }}
                                    </v-icon>
                                    <span>FCM Status: {{ fcmStatus }}</span>
                                </div>

                                <div class="d-flex align-center mb-2">
                                    <v-icon :color="getStatusColor('token')" class="mr-2">
                                        {{ getStatusIcon("token") }}
                                    </v-icon>
                                    <span>FCM Token: {{ tokenStatus }}</span>
                                </div>

                                <div class="d-flex align-center">
                                    <v-icon :color="getStatusColor('backend')" class="mr-2">
                                        {{ getStatusIcon("backend") }}
                                    </v-icon>
                                    <span>Backend Connection: {{ backendStatus }}</span>
                                </div>
                            </v-card-text>
                        </v-card>

                        <!-- Actions -->
                        <v-card variant="outlined" class="mb-4">
                            <v-card-title class="text-h6">Test Actions</v-card-title>
                            <v-card-text>
                                <div class="d-flex flex-wrap gap-2">
                                    <v-btn color="primary" @click="runFullTest" :loading="testing"
                                        prepend-icon="mdi-play-circle">
                                        Run Full Test
                                    </v-btn>

                                    <v-btn color="secondary" @click="requestPermission"
                                        :disabled="notificationPermission === 'granted'" prepend-icon="mdi-bell">
                                        Request Permission
                                    </v-btn>

                                    <v-btn color="success" @click="initializeFCM" :loading="initializing"
                                        prepend-icon="mdi-fire">
                                        Initialize FCM
                                    </v-btn>

                                    <v-btn color="warning" @click="sendTestNotification"
                                        :disabled="notificationPermission !== 'granted'" :loading="testing"
                                        prepend-icon="mdi-message-alert">
                                        Test Notifications
                                    </v-btn>
                                </div>
                            </v-card-text>
                        </v-card>

                        <!-- Test Results -->
                        <v-card v-if="testResults.length > 0" variant="outlined" class="mb-4">
                            <v-card-title class="text-h6">Test Results</v-card-title>
                            <v-card-text>
                                <div v-for="result in testResults" :key="result.test" class="mb-2">
                                    <div class="d-flex align-center">
                                        <v-icon :color="getResultColor(result.status)" class="mr-2">
                                            {{ getResultIcon(result.status) }}
                                        </v-icon>
                                        <strong>{{ result.test }}:</strong>
                                        <span class="ml-2">{{ result.message }}</span>
                                    </div>
                                    <div v-if="result.details" class="ml-8 text-caption text-medium-emphasis">
                                        {{ result.details }}
                                    </div>
                                </div>
                            </v-card-text>
                        </v-card>

                        <!-- Token Display -->
                        <v-card v-if="currentToken" variant="outlined" class="mb-4">
                            <v-card-title class="text-h6">FCM Token</v-card-title>
                            <v-card-text>
                                <v-textarea v-model="currentToken" readonly rows="3" variant="outlined"
                                    label="Current FCM Token" class="mb-2" />
                                <v-btn size="small" prepend-icon="mdi-content-copy" @click="copyToken">
                                    Copy Token
                                </v-btn>
                            </v-card-text>
                        </v-card>

                        <!-- Environment Check -->
                        <v-card variant="outlined">
                            <v-card-title class="text-h6">Environment Configuration</v-card-title>
                            <v-card-text>
                                <v-list density="compact">
                                    <v-list-item>
                                        <v-list-item-title>API Key</v-list-item-title>
                                        <v-list-item-subtitle>{{
                                            maskValue(firebaseConfig.apiKey)
                                            }}</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>Sender ID</v-list-item-title>
                                        <v-list-item-subtitle>{{
                                            maskValue(firebaseConfig.messagingSenderId)
                                            }}</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>App ID</v-list-item-title>
                                        <v-list-item-subtitle>{{
                                            maskValue(firebaseConfig.appId)
                                            }}</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>VAPID Key</v-list-item-title>
                                        <v-list-item-subtitle>{{
                                            maskValue(firebaseConfig.vapidKey)
                                            }}</v-list-item-subtitle>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import fcmService from "@/services/fcmService";
import fcmTester from "@/utils/fcmTest";
import { api } from "@/services/api";

// Reactive state
const notificationPermission = ref(Notification.permission || "default");
const fcmStatus = ref("Not initialized");
const tokenStatus = ref("Not generated");
const backendStatus = ref("Unknown");
const currentToken = ref("");
const testResults = ref([]);
const testing = ref(false);
const initializing = ref(false);
const fcmInitialized = ref(false);

// Firebase configuration from environment variables
const firebaseConfig = ref({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
});

// Computed
const isSupported = computed(() => fcmService.isSupported());

// Methods
const updateStatus = () => {
    notificationPermission.value = Notification.permission || "default";
    fcmStatus.value = fcmInitialized.value ? "Initialized" : "Not initialized";
    tokenStatus.value = currentToken.value ? "Generated" : "Not generated";
};

const runFullTest = async () => {
    testing.value = true;
    try {
        const results = await fcmTester.runAllTests();
        testResults.value = results;
        updateStatus();
    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        testing.value = false;
    }
};

const requestPermission = async () => {
    try {
        const permission = await fcmService.requestPermission();
        notificationPermission.value = permission;
        updateStatus();
    } catch (error) {
        console.error("Permission request failed:", error);
    }
};

const initializeFCM = async () => {
    initializing.value = true;
    try {
        const initialized = await fcmService.initialize();
        fcmInitialized.value = initialized;

        if (initialized) {
            currentToken.value = fcmService.getCurrentToken() || "";
            fcmStatus.value = "Initialized";
        } else {
            fcmStatus.value = "Failed to initialize";
        }

        updateStatus();
    } catch (error) {
        console.error("FCM initialization failed:", error);
        fcmStatus.value = "Error: " + error.message;
    } finally {
        initializing.value = false;
    }
};

const sendTestNotification = async () => {
    testing.value = true;
    console.log("🧪 Starting notification tests...");

    try {
        // Clear previous test results for notifications
        testResults.value = testResults.value.filter(
            (r) =>
                !r.test.includes("Notification") && !r.test.includes("Backend Test")
        );

        // Test 1: Browser notification
        if ("Notification" in window && Notification.permission === "granted") {
            try {
                const notification = new Notification(
                    "Notification - FCM Test - Browser Notification",
                    {
                        body: "This is a test browser notification from the FCM test page",
                        icon: "/pwa-192x192.png",
                        tag: "fcm-test-browser",
                        requireInteraction: false,
                    }
                );

                notification.onclick = () => {
                    console.log("Browser notification clicked");
                    notification.close();
                };

                // Auto close after 5 seconds
                setTimeout(() => notification.close(), 5000);

                testResults.value.push({
                    test: "Browser Notification",
                    status: "pass",
                    message: "Browser notification sent successfully",
                    details: "Check if you see the notification in the top-right corner",
                });

                console.log("✅ Browser notification sent");
            } catch (error) {
                testResults.value.push({
                    test: "Browser Notification",
                    status: "fail",
                    message: "Failed to send browser notification",
                    details: error.message,
                });
            }
        } else {
            testResults.value.push({
                test: "Browser Notification",
                status: "fail",
                message: "Notification permission not granted",
                details: 'Click "Request Permission" first',
            });
        }

        // // Test 2: FCM Service notification (if available)
        // if (fcmInitialized.value && currentToken.value) {
        //     // Test FCM service notification callback
        //     if (fcmService.notificationCallback) {
        //         try {
        //             const testNotificationData = {
        //                 title: 'testNotificationData - FCM Test - Service Notification',
        //                 message: 'This is a test notification from FCM service',
        //                 type: 'info',
        //                 severity: 'info',
        //                 persistent: false,
        //                 timeout: 5000,
        //                 reference_id: null,
        //                 reference_type: null,
        //                 notification_id: 'test_' + Date.now()
        //             }

        //             fcmService.notificationCallback(testNotificationData)

        //             testResults.value.push({
        //                 test: 'FCM Service Notification',
        //                 status: 'pass',
        //                 message: 'FCM service notification triggered',
        //                 details: 'Check if you see the in-app notification (snackbar)'
        //             })

        //             console.log('✅ FCM service notification triggered')
        //         } catch (error) {
        //             testResults.value.push({
        //                 test: 'FCM Service Notification',
        //                 status: 'fail',
        //                 message: 'FCM service notification failed',
        //                 details: error.message
        //             })
        //         }
        //     } else {
        //         testResults.value.push({
        //             test: 'FCM Service Notification',
        //             status: 'warning',
        //             message: 'FCM notification callback not set',
        //             details: 'FCM service may not be fully initialized'
        //         })
        //     }

        //     // Test 3: Backend notification (if available)
        //     try {
        //         await sendBackendTestNotification()
        //     } catch (error) {
        //         testResults.value.push({
        //             test: 'Backend Test Notification',
        //             status: 'fail',
        //             message: 'Failed to send backend test notification',
        //             details: error.message
        //         })
        //         console.log('❌ Backend test notification failed:', error.message)
        //     }
        // } else {
        //     testResults.value.push({
        //         test: 'FCM Token Test',
        //         status: 'fail',
        //         message: 'FCM not initialized or token not available',
        //         details: 'Click "Initialize FCM" first'
        //     })
        // }

        console.log("🎉 Notification tests completed");
    } catch (error) {
        console.error("Test notification failed:", error);
        testResults.value.push({
            test: "Test Notification",
            status: "fail",
            message: "Test notification failed",
            details: error.message,
        });
    } finally {
        testing.value = false;
    }
};

const sendBackendTestNotification = async () => {
    if (!currentToken.value) {
        throw new Error("No FCM token available");
    }

    try {
        const response = await api.post("/core/fcm/test/", {
            token: currentToken.value,
            title: "FCM Test - Backend Notification",
            message: "This is a test notification sent from the backend via FCM",
            data: {
                type: "test",
                test_id: Date.now().toString(),
            },
        });

        if (response.data.success) {
            testResults.value.push({
                test: "Backend Test Notification",
                status: "pass",
                message: "Backend test notification sent successfully",
                details: "Check if you receive the FCM notification",
            });
        } else {
            throw new Error(response.data.message || "Backend test failed");
        }
    } catch (error) {
        throw new Error(
            `Backend test failed: ${error.response?.data?.message || error.message}`
        );
    }
};

const copyToken = async () => {
    try {
        await navigator.clipboard.writeText(currentToken.value);
        alert("Token copied to clipboard!");
    } catch (error) {
        console.error("Failed to copy token:", error);
    }
};

const maskValue = (value) => {
    if (!value || value.includes("placeholder") || value.includes("test_")) {
        return "❌ Not configured";
    }
    if (value.length > 10) {
        return value.substring(0, 8) + "..." + value.substring(value.length - 4);
    }
    return value;
};

const getStatusColor = (type) => {
    const status = {
        permission: notificationPermission.value,
        fcm: fcmInitialized.value ? "granted" : "denied",
        token: currentToken.value ? "granted" : "denied",
        backend: backendStatus.value,
    };

    switch (status[type]) {
        case "granted":
        case "Initialized":
        case "Generated":
        case "Connected":
            return "success";
        case "denied":
        case "Failed":
        case "Error":
            return "error";
        default:
            return "warning";
    }
};

const getStatusIcon = (type) => {
    const color = getStatusColor(type);
    return color === "success"
        ? "mdi-check-circle"
        : color === "error"
            ? "mdi-close-circle"
            : "mdi-help-circle";
};

const getResultColor = (status) => {
    const colors = {
        pass: "success",
        fail: "error",
        warning: "warning",
        info: "info",
    };
    return colors[status] || "grey";
};

const getResultIcon = (status) => {
    const icons = {
        pass: "mdi-check-circle",
        fail: "mdi-close-circle",
        warning: "mdi-alert",
        info: "mdi-information",
    };
    return icons[status] || "mdi-help-circle";
};

// Lifecycle
onMounted(() => {
    updateStatus();

    // Check if FCM service is already initialized
    if (fcmService.getCurrentToken()) {
        fcmInitialized.value = true;
        currentToken.value = fcmService.getCurrentToken();
    }
});
</script>

<style scoped>
.fcm-test-page {
    padding: 20px;
}

.gap-2 {
    gap: 8px;
}
</style>
