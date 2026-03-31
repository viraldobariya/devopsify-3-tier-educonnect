// src/features/auth/components/LoginForm.jsx
import { useEffect, useState } from 'react';
import { isValidEmail, isValidPassword } from '../../../utils/Validator';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginService } from '../../../services/authService';

const LoginForm = () => {


  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(store => store.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  })

  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!formData.emailOrUsername || !formData.password) {
      setErrorMessage("Fill all the fields.");
      return;
    }
    if (!isValidPassword(formData.password)) {
      setErrorMessage("Password should be of length 8 to 16 and must contain at least one alphabet, number and special character.");
      setLoading(false);
      return;
    }
    let username;
    let email;
    if (isValidEmail(formData.emailOrUsername)) {
      email = formData.emailOrUsername;
    } else {
      username = formData.emailOrUsername;
    }

    setLoading(true)

    try {
      const res = await dispatch(loginService({ email, username, password: formData.password }));
      console.log(res);
      if (res.status === 200) {
        console.log(res.data);
        localStorage.setItem("accessToken", res.data.accessToken);
        navigate('/');
        return;
      } else {
        setErrorMessage("Invalid login credentials.");
        setFormData({ emailOrUsername: '', password: '' });
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Something went wrong. Please try again.");
      setFormData({ emailOrUsername: '', password: '' });
    } finally{
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset disabled={loading} className="space-y-6">
        <div className="space-y-4">
          <div className="relative m-2 border-2 rounded-xl border-white p-2">
            <input
              type="text"
              name="emailOrUsername"
              placeholder="Email or Username"
              value={formData.emailOrUsername}
              onChange={handleChange}
              className="input-premium"
            />
          </div>
          
          <div className="relative m-2 border-2 rounded-xl border-white p-2">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input-premium"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-premium w-full py-4 text-lg font-semibold border-amber-400 border-4 rounded-3xl"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </button>

        {errorMessage && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm font-medium text-center">
              {errorMessage}
            </p>
          </div>
        )}
      </fieldset>
    </form>
  );
};

export default LoginForm;