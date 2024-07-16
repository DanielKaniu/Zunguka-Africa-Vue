<template>
    <div class="card">
      <TabView class="tabview-custom">
        <TabPanel>
          <!-- Tab header for Login -->
          <template #header>
            <div class="flex align-items-center gap-2">
              <span class="font-bold white-space-nowrap">Login</span>
            </div>
          </template>
          <p class="m-0">
            <!-- Input group for username -->
            <InputGroup class="mt-4">
              <InputGroupAddon>
                <i class="pi pi-user"></i>
              </InputGroupAddon>
              <FloatLabel>
                <InputText placeholder="Enter username" v-model="username" />
                <label for="username">Enter username</label>
              </FloatLabel>
            </InputGroup>
            <!-- Input group for password -->
            <InputGroup class="mt-5 mb-5">
              <FloatLabel>
                <Password v-model="password" toggleMask>
                  <template #header>
                    <h6>Pick a password</h6>
                  </template>
                  <template #footer>
                    <Divider />
                    <p class="mt-2">Suggestions</p>
                    <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                      <li>At least one lowercase</li>
                      <li>At least one uppercase</li>
                      <li>At least one numeric</li>
                      <li>Minimum 8 characters</li>
                    </ul>
                  </template>
                </Password>
                <label for="password">Enter password</label>
              </FloatLabel>
            </InputGroup>
            <!-- Login button -->
            <Button label="Login" @click="loginUser" severity="success" rounded :loading="isLoading" :disabled="isLoading"/>
            <div class="mt-3">
              <a href="#" @click.prevent="showForgotPasswordModal">Forgot Password?</a>
            </div>
            <!-- Display error message if any -->
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          </p>
        </TabPanel>
              <!-- Register Tab -->
      <!-- Register Tab -->
      <TabPanel>
        <template #header>
          <div class="flex align-items-center gap-2">
            <span class="font-bold white-space-nowrap">Register</span>
          </div>
        </template>
        <div class="register-form">
          <div class="form-column">
            <!-- Full Name -->
            <InputGroup class="mb-5 mt-3">
              <InputGroupAddon>
                <i class="pi pi-user"></i>
              </InputGroupAddon>
              <FloatLabel>
                <InputText placeholder="Full Name" v-model="registerForm.fullName" />
                <label for="fullName">Full Name</label>
              </FloatLabel>
            </InputGroup>

            <!-- Username -->
            <InputGroup class="mb-5">
              <InputGroupAddon>
                <i class="pi pi-id-card"></i>
              </InputGroupAddon>
              <FloatLabel>
                <InputText placeholder="Username" v-model="registerForm.userName" />
                <label for="userName">Username</label>
              </FloatLabel>
            </InputGroup>

            <!-- Email -->
            <InputGroup class="mb-5">
              <InputGroupAddon>
                <i class="pi pi-envelope"></i>
              </InputGroupAddon>
              <FloatLabel>
                <InputText type="email" placeholder="Email" v-model="registerForm.email" />
                <label for="email">Email</label>
              </FloatLabel>
            </InputGroup>
          </div>

          <div class="form-column">
            <!-- Password -->
            <InputGroup class="mb-5 mt-3">
              <FloatLabel>
                <Password v-model="registerForm.password" toggleMask>
                  <template #header>
                    <h6>Pick a password</h6>
                  </template>
                  <template #footer>
                    <Divider />
                    <p class="mt-2">Suggestions</p>
                    <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                      <li>At least one lowercase</li>
                      <li>At least one uppercase</li>
                      <li>At least one numeric</li>
                      <li>Minimum 8 characters</li>
                    </ul>
                  </template>
                </Password>
                <label for="password">Password</label>
              </FloatLabel>
            </InputGroup>

            <!-- Confirm Password -->
            <InputGroup class="mb-5">
              <FloatLabel>
                <Password v-model="registerForm.confirmPassword" toggleMask />
                <label for="confirmPassword">Confirm Password</label>
              </FloatLabel>
            </InputGroup>

            <!-- Role -->
            <InputGroup class="mb-5">
              <FloatLabel>
                <Dropdown v-model="registerForm.role" :options="roles" optionLabel="name" optionValue="value" placeholder="Select Role" />
                <label for="role">Role</label>
              </FloatLabel>
            </InputGroup>
          </div>
        </div>

        <!-- Register button -->
        <Button label="Register" @click="registerUser" severity="success" rounded class="mt-3 w-full" :loading="isLoading" :disabled="isLoading" />

        <!-- Display error message if any -->
        <div v-if="registerErrorMessage" class="error-message">{{ registerErrorMessage }}</div>
      </TabPanel>
      </TabView>
    </div>
    <Dialog 
      v-model:visible="forgotPasswordModalVisible" 
      header="Reset Password" 
      :style="{ width: '350px' }" 
      :headerStyle="{ background: '#f8f9fa', color: '#495057' }"
      headerClass="custom-dialog-header"
    >
      <div class="p-fluid">
        <div class="p-field">
          <label for="email">Email</label>
          <InputText id="email" v-model="forgotPasswordEmail" type="email" :disabled="isLoading" />
        </div>
      </div>
      <template #footer>
        <Button 
          label="Reset Password" 
          @click="resetPassword" 
          :loading="isLoading"
          :disabled="isLoading"
          rounded 
        />
      </template>
    </Dialog>
    <Toast />
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue';
  import axios from 'axios';
  import axiosInstance from '../axiosInstance';
  import { useRouter } from 'vue-router';
  import TabView from 'primevue/tabview';
  import TabPanel from 'primevue/tabpanel';
  import InputGroup from 'primevue/inputgroup';
  import InputGroupAddon from 'primevue/inputgroupaddon';
  import InputText from 'primevue/inputtext';
  import FloatLabel from 'primevue/floatlabel';
  import Divider from 'primevue/divider';
  import Password from 'primevue/password';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import Dialog from 'primevue/dialog'
  import { useToast } from 'primevue/usetoast';
  import Toast from 'primevue/toast';

  // Define reactive variables for username, password, and error message
  const router = useRouter();
  //
  //Login form data.
  const username = ref('');
  const password = ref('');
  const errorMessage = ref<string | null>(null);
  //
  //The loading spinner.
  const isLoading = ref(false);
  //
  // Register form data
  const registerForm = reactive({
    fullName: 'Dan',
    userName: 'D',
    email: 'dan@gmail.com',
    password: '12345',
    confirmPassword: '12345',
    role: 'Admin',
  });

  const registerErrorMessage = ref<string | null>(null);

  // Role options for dropdown
  const roles = [
    { name: 'Admin', value: 'admin' },
    { name: 'User', value: 'user' },
    // Add more roles as needed
  ];

  const toast = useToast();
  const forgotPasswordModalVisible = ref(false);
const forgotPasswordEmail = ref('');

const showForgotPasswordModal = () => {
  forgotPasswordModalVisible.value = true;
};

const resetPassword = async () => {
  if (!forgotPasswordEmail.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Email is required', life: 3000 });
    return;
  }

  isLoading.value = true;  // Set loading to true when starting the request

  try {
    const response = await axiosInstance.post('/auth/forgotPassword', {
      email: forgotPasswordEmail.value
    });
    
    if (response.data.ok) {
      toast.add({ severity: 'success', summary: 'Success', detail: response.data.message, life: 5000 });
      forgotPasswordModalVisible.value = false;
      forgotPasswordEmail.value = ''; // Clear the email input
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: response.data.message, life: 5000 });
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message || 'An error occurred', life: 5000 });
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred', life: 5000 });
    }
  } finally {
    isLoading.value = false;  // Set loading back to false when the request is complete
  }
};

  const loginUser = async () => {
    errorMessage.value = null;

    if (!username.value || !password.value) {
      errorMessage.value = 'Both username and password are required';
      return;
    }


    isLoading.value = true;  // Set loading to true when starting the request

    try {
      const response = await axiosInstance.post('/auth/loginUser', {
        login: username.value,
        password: password.value,
      });

      if (response.data.ok) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        router.push('/analysis');
      } else {
        errorMessage.value = response.data.message || 'Login failed';
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        errorMessage.value = error.response.data.message || 'An error occurred during login';
      } else {
        errorMessage.value = 'An error occurred during login';
      }
    } finally {
    isLoading.value = false;  // Set loading back to false when the request is complete
  }
  };

const registerUser = async () => {
  registerErrorMessage.value = null;

  // Basic form validation
  if (!registerForm.fullName || !registerForm.userName || !registerForm.email || !registerForm.password || !registerForm.confirmPassword || !registerForm.role) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'All fields are required', life: 3000 });
    return;
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', life: 3000 });
    return;
  }

  isLoading.value = true;

  try {
    const response = await axiosInstance.post('/auth/registerUser', {
      fullName: registerForm.fullName,
      userName: registerForm.userName,
      email: registerForm.email,
      password: registerForm.password,
      role: registerForm.role,
    });

    if (response.data.ok) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.add({ severity: 'success', summary: 'Success', detail: 'Registration successful', life: 3000 });
      router.push('/analysis');
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: response.data.message || 'Registration failed', life: 3000 });
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 422) {
        // Validation errors
        const errors = error.response.data.errors;
        if (typeof errors === 'object' && errors !== null) {
          Object.values(errors).forEach(errorArray => {
            if (Array.isArray(errorArray)) {
              errorArray.forEach(err => {
                toast.add({ severity: 'error', summary: 'Validation Error', detail: err, life: 5000 });
              });
            }
          });
        } else if (Array.isArray(errors)) {
          errors.forEach(err => {
            toast.add({ severity: 'error', summary: 'Validation Error', detail: err, life: 5000 });
          });
        } else {
          toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Validation failed', life: 5000 });
        }
      } else {
        toast.add({ severity: 'error', summary: 'Error', detail: error.response.data.message || 'An error occurred during registration', life: 3000 });
      }
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred during registration', life: 3000 });
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
  
<style scoped>
.card {
  max-width: 800px; /* Increased width to accommodate two columns */
  margin: 0 auto; /* Center the card horizontally */
  padding: 20px;
}

.register-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.form-column {
  flex: 1;
  min-width: 250px; /* Ensure columns don't get too narrow */
}

.error-message {
  color: red; /* Style error messages in red */
  margin-top: 10px; /* Add some space above the error message */
}

button{
  color: #004183;
  background: #c4b500;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .card {
    max-width: 100%;
    padding: 10px;
  }

  .register-form {
    flex-direction: column;
  }

  .form-column {
    width: 100%;
  }
}
</style> 