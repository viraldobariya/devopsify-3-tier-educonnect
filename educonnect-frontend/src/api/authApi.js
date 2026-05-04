import apiClient from './apiClient';

export const checkAvailability = async data => {
  const res = await apiClient.post('auth/check-availability', data);

  return res;
};

export const signUp = async (user, avatar) => {
  const formData = new FormData();
  formData.append(
    'user',
    new Blob([JSON.stringify(user)], { type: 'application/json' })
  );
  formData.append('avatar', avatar);
  const res = await apiClient.post('auth/sign-up', formData, {
    'Content-Type': 'multipart/form-data',
  });
  return res;
};

export const login = async data => {
  console.log(data)
  const res = await apiClient.post('/auth/login', data);
  return res;
};

export const logout = async () => {
  await apiClient.post('/auth/logout');
};

export const refreshToken = async () => {
  const res = await apiClient.post('/auth/refresh-token', {});
  return res;
}

export const autoLogin = async () => {
  console.log(localStorage.getItem("accessToken"))
  const res = await apiClient.get('/auth/me')
  return res;
}