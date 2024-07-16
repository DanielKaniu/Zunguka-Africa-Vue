<template>
    <div class="reset-password-container">
      <div class="reset-password-form">
        <h2>Reset Password</h2>
        <form @submit.prevent="validateAndResetPassword">
          <input type="hidden" v-model="token">
          <div class="p-field">
            <span class="p-float-label">
              <InputText id="email" type="email" v-model="email" required />
              <label for="email">Email</label>
            </span>
          </div>
          <div class="p-field">
            <span class="p-float-label">
              <Password id="password" v-model="password" :toggleMask="true" required>
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
              <label for="password">New Password</label>
            </span>
          </div>
          <div class="p-field">
            <span class="p-float-label">
              <Password id="password_confirmation" v-model="password_confirmation" :toggleMask="true" :feedback="false" required />
              <label for="password_confirmation">Confirm New Password</label>
            </span>
          </div>
          <Button type="submit" label="Reset Password" class="p-button-primary" />
        </form>
      </div>
    </div>
    <Toast />
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import axiosInstance from '../axiosInstance';
  import Toast from 'primevue/toast';
  import InputText from 'primevue/inputtext';
  import Password from 'primevue/password';
  import Button from 'primevue/button';
    import Divider from 'primevue/divider';
  
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  
  const token = ref('');
  const email = ref('');
  const password = ref('');
  const password_confirmation = ref('');
  
  onMounted(() => {
    token.value = route.query.token;
    email.value = route.query.email;
  });
  
  const validateAndResetPassword = () => {
    if (password.value !== password_confirmation.value) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', life: 3000 });
      return;
    }
  
    if (password.value.length < 8) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Password must be at least 8 characters long', life: 3000 });
      return;
    }
  
    resetPassword();
  };
  
  const resetPassword = async () => {
    try {
      const response = await axiosInstance.post('/auth/resetPassword', {
        token: token.value,
        email: email.value,
        password: password.value,
        password_confirmation: password_confirmation.value
      });
  
      if (response.data.ok) {
        toast.add({ severity: 'success', summary: 'Success', detail: response.data.message, life: 3000 });
        setTimeout(() => router.push('/home'), 3000);
      } else {
        toast.add({ severity: 'error', summary: 'Error', detail: response.data.message, life: 3000 });
      }
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred. Please try again.', life: 3000 });
    }
  };
  </script>
  
  <style scoped>
  .reset-password-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
    background-color: #004183;
  }
  
  .reset-password-form {
    background-color: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  
  h2 {
    color: #004183;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .p-field {
    margin-bottom: 1.5rem;
  }

  .p-button{
    color: #004183;
    background: #c4b500;
  }
  
  @media (max-width: 480px) {
    .reset-password-form {
      padding: 1.5rem;
    }
  }
  </style>