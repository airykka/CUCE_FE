<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-content">
        <!-- Logo -->
        <div class="logo-wrapper">
          <Logo />
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Welcome Text -->
          <div v-if="step === 1" class="welcome-text">
            <h1>Get Started</h1>
            <p>Get Started, please enter your details.</p>
          </div>
          <div v-else-if="step === 2" class="welcome-text">
            <h1>Create Your Account</h1>
            <p>Please enter your details below to create your account.</p>
          </div>

          <form @submit.prevent="handleSubmit">
            <!-- Step 1 -->
            <div v-if="step === 1" class="form-step">
              <!-- <h2>Step 1: Account Setup</h2> -->
              <FormInput
                id="email"
                label="Email"
                v-model="form.email"
                type="email"
                placeholder="Enter email"
                required
                :error="emailError"
              />

              <FormInput
                id="password"
                label="Password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter password"
                required
                :error="passwordError"
              >
                <template #button>
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showPassword = !showPassword"
                  >
                    <EyeIcon v-if="showPassword" />
                    <EyeOffIcon v-else />
                  </button>
                </template>
              </FormInput>

              <FormInput
                id="confirm-password"
                label="Confirm Password"
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Confirm password"
                required
                :error="passwordError"
              />

              <Button type="button" variant="primary" @click="nextStep">
                Next
              </Button>
            </div>

            <!-- Step 2 -->
            <!-- Step 2 -->
            <div v-else-if="step === 2" class="form-step">
              <!-- Student Number -->
              <FormInput
                id="student-number"
                label="Student Number"
                v-model="form.studentNumber"
                type="text"
                placeholder="Enter student number"
                required
                :error="studentNumberError"
              />

              <!-- First and Last Name side by side -->
              <div class="name-row">
                <FormInput
                  id="firstname"
                  label="First Name"
                  v-model="form.firstName"
                  type="text"
                  placeholder="Enter first name"
                  required
                  :error="firstName"
                />

                <FormInput
                  id="lastname"
                  label="Last Name"
                  v-model="form.lastName"
                  type="text"
                  placeholder="Enter last name"
                  required
                  :error="lastName"
                />
              </div>

              <!-- Upload and Buttons -->
              <div class="form-group">
                <label for="profile">Upload Profile picture (Optional)</label>
                <div class="upload-container" @click="triggerFileDialog">
                  <div class="upload-icon"><UploadIcon /></div>
                  <h2 class="upload-title">Upload File</h2>

                  <p class="upload-subtitle">Maximum size upload: 50MB</p>
                  <input
                    type="file"
                    id="profile"
                    class="hidden-input"
                    accept="*/*"
                    ref="fileInput"
                    @change="handleFileUpload"
                  />
                </div>
                <p v-if="file" class="file-name">
                  Selected file: {{ file.name }}
                </p>
              </div>

              <div class="button-group">
                <!-- <Button type="button" variant="secondary" @click="prevStep"
                  >Back</Button
                > -->
                <Button type="submit" variant="primary" :loading="isLoading">
                  {{ isLoading ? "Submitting..." : "Sign up" }}
                </Button>
              </div>
            </div>

            <div v-if="formError" class="error-message">
              {{ formError }}
            </div>
          </form>
        </div>

        <!-- Copyright -->
        <div class="copyright">
          <p>© 2025 Charisma All rights reserved</p>
        </div>
      </div>

      <!-- Right Side Content -->
      <div class="feature-content">
        <div class="gradient-blur"></div>
        <Carousel />
        <div class="circles top-left-circle"></div>
        <div class="circles bottom-right-circle"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import EyeIcon from "~/components/icons/EyeIcon.vue";
import EyeOffIcon from "~/components/icons/EyeOffIcon.vue";
import UploadIcon from "~/components/icons/UploadIcon.vue";
import Logo from "~/components/Logo.vue";
import Button from "~/components/ui/Button.vue";
import Carousel from "~/components/ui/Carousel.vue";
import FormInput from "~/components/ui/FormInput.vue";
import { useBackendService } from "~/composables/useBackendService";

// State
const step = ref(1);
const showPassword = ref(false);
const formError = ref("");
const emailError = ref("");
const passwordError = ref("");
const firstName = ref("");
const lastName = ref("");
const studentNumberError = ref("");

const toast = useToast();

const form = ref({
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  studentNumber: "",
  profilePicture: null as File | null,
});

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const token = route.query.token as string;
let file = null as File | null;

const validateEmail = (value: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value);
};

onMounted(() => {
  authStore.logout();
});

const { call, isLoading, data } = useBackendService(
  "/students/accept-invite",
  "post"
);

const nextStep = () => {
  formError.value = "";
  if (
    !form.value.email ||
    !form.value.password ||
    !form.value.confirmPassword
  ) {
    formError.value = "Please fill out all fields.";
    emailError.value = "Email is required";
    return;
  }
  if (form.value.password !== form.value.confirmPassword) {
    passwordError.value = "Passwords do not match.";
    return;
  }
  if (!validateEmail(form.value.email)) {
    formError.value = "Invalid email format.";
    emailError.value = "Enter a valid email address.";

    return;
  }
  step.value = 2;
};

const prevStep = () => {
  step.value = 1;
};

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileDialog = () => {
  fileInput.value?.click();
};

const filePreview = ref<string | null>(null);

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  file = target.files?.[0] as any;

  if (file) {
    form.value.profilePicture = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      filePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  formError.value = "";

  if (
    !form.value.firstName ||
    !form.value.lastName ||
    !form.value.studentNumber
  ) {
    formError.value = "Please fill out all personal details.";
    firstName.value = "First name is required";
    lastName.value = "Last name is required";
    return;
  }

  const payload = new FormData();
  payload.append("reg_number", form.value.studentNumber);
  payload.append("email", form.value.email);
  payload.append("password", form.value.password);
  payload.append("first_name", form.value.firstName);
  payload.append("last_name", form.value.lastName);
  payload.append("token", token);

  if (form.value.profilePicture) {
    payload.append("profile_picture", form.value.profilePicture);
  }

  try {
    await call(payload, { headers: { "Content-Type": "multipart/form-data" } });
    toast.success("Registrar accepted successfully!");
    authStore.setAuth(
      data.value.session.access_token,
      data.value.role,
      data.value.user
    );
    router.push("/student/dashboard");
  } catch (err: any) {
    formError.value = "Failed to submit form.";
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: stretch;
  background-color: $gray-100;
  overflow: hidden;
}

.login-container {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: white;
}

.login-content {
  padding: 2rem 4rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
}

.logo-wrapper {
  flex-shrink: 0;
  padding-top: 2rem;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
}

.welcome-text {
  margin-bottom: 2rem;
  h1 {
    font-family: $font-family-heading;
    font-size: $text-4xl;
    font-weight: 700;
    color: $text-color;
    margin-bottom: 0.5rem;
  }
  p {
    font-family: $font-family;
    color: $gray-600;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: $font-family;
    font-size: $text-sm;
    input[type="checkbox"] {
      width: auto;
    }
  }

  .forgot-password {
    font-family: $font-family;
    color: $primary-color;
    text-decoration: none;
    font-size: $text-sm;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
}
.name-row {
  display: flex;
  gap: 1rem;
}
.name-row > * {
  flex: 1;
}
.copyright {
  flex-shrink: 0;
  text-align: center;
  color: $gray-600;
  font-family: $font-family;
  font-size: $text-sm;
  padding-bottom: 2rem;
}

.feature-content {
  background: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin: 20px;
  border-radius: 40px;

  .circles {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: $white;
    z-index: 1;

    &.top-left-circle {
      top: 10%;
      left: -40px;
    }
    &.bottom-right-circle {
      bottom: 10%;
      right: -40px;
    }
  }
}

.gradient-blur {
  position: absolute;
  inset: 0;
  opacity: 0.95;
  background: url("@/assets/images/BG_Image.png") center/cover no-repeat;
  mix-blend-mode: normal;
  pointer-events: none;
  filter: contrast(1.1) blur(20px);
  transform-origin: center;
  animation: float 0.8s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) scale(1.01) rotate(1deg);
  }
  100% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

.toggle-password {
  color: $gray-600;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;

  &:hover {
    color: $text-color;
  }
}

@media (max-width: $breakpoint-lg) {
  .login-container {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100vh;
  }

  .login-content {
    padding: 2rem;
  }

  .feature-content {
    display: none;
  }
}

.error-message {
  color: $error-500;
  font-size: $text-sm;
  margin-top: 0.5rem;
  text-align: center;
}
.form-wrapper {
  max-width: 500px;
  margin: auto;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  label {
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  input[type="file"] {
    padding: 0.5rem 0;
  }
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.upload-container {
  width: 100%;
  max-width: 600px;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 30px 40px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-container:hover {
  border-color: #3b82f6;
  background-color: #f8faff;
}

.upload-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1.3;
}

.upload-subtitle {
  font-size: 16px;
  color: #6b7280;
  font-weight: 400;
  line-height: 1.5;
}

.hidden-input {
  display: none;
}

@media (max-width: 640px) {
  .upload-container {
    padding: 40px 24px;
    max-width: 90%;
  }

  .upload-title {
    font-size: 20px;
  }

  .upload-subtitle {
    font-size: 14px;
  }
}
</style>
